import { getLogger } from '../utils';
import { StateManager } from '../engine/state/StateManager';
import { buildWorldSnapshot, snapshotToString } from './snapshotBuilder';
import { executeActionByName } from '../engine/actions/actionRegistry';
import { AgentMessage, AgentToolResult, LlmClient, LlmTool } from './llm/LlmClient';

const log = getLogger('agent');

export interface RunTurnResult {
    narration: string;
    updatedHistory: AgentMessage[];
}

/**
 * Run a single player turn through the LLM agent loop.
 *
 * The LLM may call zero or more tools before producing a final narration.
 * Tool calls within one turn accumulate state changes — a committed transaction
 * is written only when the LLM stops calling tools and returns prose.
 *
 * On error, the transaction is rolled back and the error is re-thrown.
 */
export async function runTurn(
    input: string,
    stateManager: StateManager,
    llmClient: LlmClient,
    systemPrompt: string,
    tools: LlmTool[],
    history: AgentMessage[],
): Promise<RunTurnResult> {
    log.info(`Turn start | input: "${input}" | history: ${history.length} messages`);

    let state = stateManager.beginTransaction();
    const snapshot = snapshotToString(buildWorldSnapshot(state));
    log.debug(`World snapshot:\n${snapshot}`);

    const userMessage: AgentMessage = { role: 'user', text: `${input}\n\n${snapshot}` };
    let currentMessages: AgentMessage[] = [...history, userMessage];

    let round = 0;

    try {
        while (true) {
            round++;
            log.info(`LLM call #${round} | context: ${currentMessages.length} messages`);

            const turn = await llmClient.complete(systemPrompt, currentMessages, tools);

            // Log any text the model emitted alongside tool calls — this is the model thinking aloud
            if (turn.text && turn.toolCalls?.length) {
                log.debug(`Model thinking:\n${turn.text}`);
            }

            if (!turn.toolCalls?.length) {
                // No more tool calls — commit accumulated state and return narration
                stateManager.commit(state);
                const narration = turn.text ?? '';
                log.info(`Turn complete | rounds: ${round} | narration: ${narration.length} chars`);
                log.debug(`Narration:\n${narration}`);
                return {
                    narration,
                    updatedHistory: [...currentMessages, { role: 'assistant' as const, text: narration }],
                };
            }

            log.debug(`Tool calls this round: ${turn.toolCalls.map((c) => c.name).join(', ')}`);

            // Execute tool calls — state accumulates across all calls this turn
            const results: AgentToolResult[] = [];
            for (const call of turn.toolCalls) {
                log.info(`Tool: ${call.name} | input: ${JSON.stringify(call.input)}`);
                const { state: nextState, outcome } = executeActionByName(state, call.name, call.input);
                if (nextState) state = nextState;
                const content = JSON.stringify(outcome);
                log.debug(`Tool result: ${content}`);
                results.push({ callId: call.id, name: call.name, content });
            }

            currentMessages = [
                ...currentMessages,
                { role: 'assistant' as const, toolCalls: turn.toolCalls },
                { role: 'tool_results' as const, results },
            ];
        }
    } catch (err) {
        log.error(
            `Turn failed after ${round} rounds — rolling back | ${err instanceof Error ? err.message : String(err)}`,
        );
        stateManager.rollback();
        throw err;
    }
}
