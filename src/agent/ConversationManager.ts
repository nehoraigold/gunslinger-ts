import { getLogger } from '../utils';
import { AgentMessage, LlmClient } from './llm/LlmClient';

const log = getLogger('conversation');

const MAX_RECENT_TURNS = 12;
/** Compress when the recent-turn message count exceeds this. */
const MESSAGE_COMPRESSION_THRESHOLD = 20;
const TURNS_TO_COMPRESS = 5;

const COMPRESSION_SYSTEM_PROMPT =
    "Summarise this text adventure session in past tense from the player's perspective. " +
    'Include: major decisions, NPCs encountered, items acquired/lost, areas visited, quests started/completed. ' +
    'Omit combat round details. 200 words max.';

interface ConversationTurn {
    messages: AgentMessage[];
}

/** Extracts the final narration text from a turn's messages. */
function extractNarration(turn: ConversationTurn): string {
    for (let i = turn.messages.length - 1; i >= 0; i--) {
        const msg = turn.messages[i];
        if (msg.role === 'assistant' && msg.text && !msg.toolCalls?.length) {
            return msg.text;
        }
    }
    return '';
}

export class ConversationManager {
    /** Unbounded full transcript — for future UI/transcript use. */
    private fullHistory: AgentMessage[] = [];
    /** Sliding window of recent turns at full fidelity. */
    private recentTurns: ConversationTurn[] = [];
    /** Compressed prose of everything before the window. */
    private narrativeSummary: string | null = null;
    private compressionInFlight = false;

    /** Add the messages from one completed turn to both histories. */
    appendTurn(messages: AgentMessage[]): void {
        this.fullHistory.push(...messages);
        this.recentTurns.push({ messages });

        // Trim the window if it grew past the hard cap.
        // (Compression is fire-and-forget; this prevents unbounded growth if it lags.)
        if (this.recentTurns.length > MAX_RECENT_TURNS) {
            log.debug(`recentTurns hit cap (${MAX_RECENT_TURNS}); dropping oldest turn without compression`);
            this.recentTurns.shift();
        }
    }

    /** Returns the message array to pass to the LLM for the next turn. */
    getMessagesForAgent(): AgentMessage[] {
        const messages: AgentMessage[] = [];

        if (this.narrativeSummary) {
            messages.push({ role: 'user', text: `[Earlier session summary]\n${this.narrativeSummary}` });
            messages.push({ role: 'assistant', text: 'Understood.' });
        }

        for (const turn of this.recentTurns) {
            messages.push(...turn.messages);
        }

        return messages;
    }

    getFullHistory(): AgentMessage[] {
        return this.fullHistory;
    }

    /** True when compression should be triggered (not already in-flight, over message threshold). */
    shouldCompress(): boolean {
        if (this.compressionInFlight) return false;
        const messageCount = this.recentTurns.reduce((n, t) => n + t.messages.length, 0);
        return messageCount > MESSAGE_COMPRESSION_THRESHOLD;
    }

    /** Fire-and-forget: compresses oldest turns into narrativeSummary. Never blocks the caller. */
    compressAsync(llmClient: LlmClient, _systemPrompt: string): void {
        if (this.compressionInFlight) return;
        this.compressionInFlight = true;

        const turnsToCompress = this.recentTurns.slice(0, TURNS_TO_COMPRESS);
        const narrationLines = turnsToCompress.map(extractNarration).filter(Boolean);

        if (narrationLines.length === 0) {
            log.warn('compressAsync: no narration text found in turns to compress; skipping');
            this.compressionInFlight = false;
            return;
        }

        const combinedText = narrationLines.join('\n\n');
        const compressionMessages: AgentMessage[] = [{ role: 'user', text: combinedText }];

        log.info(`compressAsync: compressing ${turnsToCompress.length} turns (${combinedText.length} chars)`);

        llmClient
            .complete(COMPRESSION_SYSTEM_PROMPT, compressionMessages, [])
            .then((result) => {
                const summary = result.text ?? '';
                if (summary) {
                    this.narrativeSummary = this.narrativeSummary ? `${this.narrativeSummary}\n\n${summary}` : summary;
                    this.recentTurns.splice(0, TURNS_TO_COMPRESS);
                    log.info(
                        `compressAsync: done — summary now ${this.narrativeSummary.length} chars, ` +
                            `recentTurns: ${this.recentTurns.length}`,
                    );
                } else {
                    log.warn('compressAsync: LLM returned empty summary; turns retained');
                }
            })
            .catch((err: unknown) => {
                log.warn(`compressAsync: compression failed — ${err instanceof Error ? err.message : String(err)}`);
            })
            .finally(() => {
                this.compressionInFlight = false;
            });

        // The caller returns immediately — the promise chain above runs in the background.
    }

    reset(): void {
        this.fullHistory = [];
        this.recentTurns = [];
        this.narrativeSummary = null;
        this.compressionInFlight = false;
    }
}
