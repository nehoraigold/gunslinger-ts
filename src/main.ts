import Anthropic from '@anthropic-ai/sdk';
import { Ollama } from 'ollama';
import { config } from './config';
import { getLogger, initLogger, getUserInput, Print, startSpinner } from './utils';
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
import { CommandContext } from './commands/CommandRegistry';

const log = getLogger('main');

async function main() {
    initLogger(config.logPath, config.logLevel);

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

    // ── Room-change tracking ──────────────────────────────────────────────────
    let previousRoomId: string | null = null;

    // ── Game context ──────────────────────────────────────────────────────────
    const ctx: CommandContext = {
        stateManager: new StateManager(initGameState()),
        history: [] as AgentMessage[],
        storage,
        providerLabel,
        narrate: async (prompt: string): Promise<void> => {
            const spinner = startSpinner();
            try {
                const { narration, updatedHistory } = await runTurn(
                    prompt,
                    ctx.stateManager,
                    llmClient,
                    systemPrompt,
                    tools,
                    ctx.history,
                );
                spinner.stop();
                ctx.history = updatedHistory;

                const currentRoomId = ctx.stateManager.getState().player.currentRoomId;
                if (currentRoomId !== previousRoomId) {
                    const room = ctx.stateManager.getState().world.rooms[currentRoomId];
                    if (room) Print.RoomHeader(room.name);
                    previousRoomId = currentRoomId;
                }

                Print.Message(narration);
            } catch (err) {
                spinner.stop();
                Print.Message(`[Error] ${err instanceof Error ? err.message : String(err)}`);
            }
        },
    };

    registerBuiltins(registry);

    // ── Print starting room header and narrate opening scene ─────────────────
    const initialState = ctx.stateManager.getState();
    const initialRoomId = initialState.player.currentRoomId;
    const initialRoom = initialState.world.rooms[initialRoomId];
    if (initialRoom) Print.RoomHeader(initialRoom.name);
    previousRoomId = initialRoomId;

    await ctx.narrate(
        'Narrate the opening scene. Describe the setting, atmosphere, and immediate surroundings to draw the player in.',
    );

    // ── Game loop ─────────────────────────────────────────────────────────────
    while (true) {
        const input = await getUserInput();
        if (await registry.dispatch(input, ctx)) continue;
        await ctx.narrate(input);
    }
}

main();
