import Anthropic from '@anthropic-ai/sdk';
import { Ollama } from 'ollama';
import { getLogger, getUserInput, Print } from './utils';
import { GameStorage } from './engine/meta/GameStorage';
import { initGameState } from './initGameState';
import { StateManager } from './engine/state/StateManager';
import { AgentMessage } from './agent/llm/LlmClient';
import { AnthropicClient } from './agent/llm/AnthropicClient';
import { OllamaClient } from './agent/llm/OllamaClient';
import { buildToolDefinitions } from './agent/toolDefinitions';
import { buildSystemPrompt } from './agent/systemPrompt';
import { runTurn } from './agent/adventureAgent';

const log = getLogger('main');

async function main() {
    const storage = new GameStorage('./saves');
    const stateManager = new StateManager(initGameState());

    // ── Provider selection ────────────────────────────────────────────────────
    const ollamaModel = process.env.OLLAMA_MODEL;
    const llmClient = ollamaModel
        ? new OllamaClient(new Ollama(), ollamaModel)
        : new AnthropicClient(new Anthropic(), 'claude-sonnet-4-6');

    const tools = buildToolDefinitions();
    const systemPrompt = buildSystemPrompt(tools);

    log.info(`Provider: ${ollamaModel ? `Ollama (${ollamaModel})` : 'Anthropic (claude-sonnet-4-6)'}`);

    // ── Conversation history ──────────────────────────────────────────────────
    let history: AgentMessage[] = [];

    let input = '';
    while (input !== 'q') {
        input = await getUserInput();
        if (input === 'q' || input === 'quit') {
            break;
        }

        try {
            const { narration, updatedHistory } = await runTurn(
                input,
                stateManager,
                llmClient,
                systemPrompt,
                tools,
                history,
            );
            history = updatedHistory;
            Print.Message(narration);
        } catch (err) {
            Print.Message(`[Error] ${err instanceof Error ? err.message : String(err)}`);
        }
    }

    await storage.save('1', stateManager.getState());
    Print.Message('Goodbye!');
}

main();
