import Anthropic from '@anthropic-ai/sdk';
import { Ollama } from 'ollama';
import { config } from './config';
import { getLogger, setLogLevel, getUserInput, Print } from './utils';
import { GameStorage } from './engine/meta/GameStorage';
import { initGameState } from './initGameState';
import { StateManager } from './engine/state/StateManager';
import { AgentMessage } from './agent/llm/LlmClient';
import { AnthropicClient } from './agent/llm/AnthropicClient';
import { OllamaClient } from './agent/llm/OllamaClient';
import { buildToolDefinitions } from './agent/toolDefinitions';
import { buildSystemPrompt } from './agent/systemPrompt';
import { runTurn } from './agent/adventureAgent';
import { CommandRegistry } from './commands/CommandRegistry';
import { registerBuiltins } from './commands/builtins';

const log = getLogger('main');

async function main() {
    setLogLevel(config.logLevel);

    const storage = new GameStorage(config.savePath);

    // ── Provider selection ────────────────────────────────────────────────────
    const providerLabel = config.ollamaModel
        ? `Ollama (${config.ollamaModel})`
        : `Anthropic (${config.anthropicModel})`;

    const llmClient = config.ollamaModel
        ? new OllamaClient(new Ollama({ host: config.ollamaHost }), config.ollamaModel)
        : new AnthropicClient(new Anthropic(), config.anthropicModel, config.maxTokens);

    const tools = buildToolDefinitions();
    const systemPrompt = buildSystemPrompt(tools);

    log.info(`Provider: ${providerLabel}`);
    log.info(`Log level: ${config.logLevel}`);

    // ── Command registry ──────────────────────────────────────────────────────
    const registry = new CommandRegistry();
    registerBuiltins(registry);

    // ── Mutable game context (commands may replace stateManager or clear history)
    const ctx = {
        stateManager: new StateManager(initGameState()),
        history: [] as AgentMessage[],
        storage,
        providerLabel,
    };

    // ── Game loop ─────────────────────────────────────────────────────────────
    while (true) {
        const input = await getUserInput();

        if (await registry.dispatch(input, ctx)) continue;

        try {
            const { narration, updatedHistory } = await runTurn(
                input,
                ctx.stateManager,
                llmClient,
                systemPrompt,
                tools,
                ctx.history,
            );
            ctx.history = updatedHistory;
            Print.Message(narration);
        } catch (err) {
            Print.Message(`[Error] ${err instanceof Error ? err.message : String(err)}`);
        }
    }
}

main();
