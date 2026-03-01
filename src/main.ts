import Anthropic from '@anthropic-ai/sdk';
import { Ollama } from 'ollama';
import { config } from './config';
import { getLogger, initLogger, getUserInput, Print, setNarrativeFn, setInputFn } from './utils';
import { GameStorage } from './engine/meta/GameStorage';
import { initGameState } from './initGameState';
import { StateManager } from './engine/state/StateManager';
import { AnthropicClient } from './agent/llm/AnthropicClient';
import { ConversationManager } from './agent/ConversationManager';
import { OllamaClient } from './agent/llm/OllamaClient';
import { buildToolDefinitions } from './agent/toolDefinitions';
import { buildSystemPrompt } from './agent/systemPrompt';
import { runTurn, AgentCallbacks } from './agent/adventureAgent';
import { CommandRegistry } from './commands/CommandRegistry';
import { registerBuiltins } from './commands/builtins';
import { CommandContext } from './commands/CommandRegistry';
import { initUI } from './ui';

const log = getLogger('main');

async function main() {
    initLogger(config.logPath, config.logLevel);

    // ── TUI ───────────────────────────────────────────────────────────────────
    const ui = initUI();

    // Redirect Print → narrative panel
    setNarrativeFn((text) => ui.narrative.append(text));

    // Replace readline with TUI input
    setInputFn(() => ui.input.read());

    const storage = new GameStorage(config.savePath);

    // ── Start menu ────────────────────────────────────────────────────────────
    ui.input.block();
    const startResult = await ui.modals.startMenu.show(storage);
    ui.input.unblock();

    if (startResult.action === 'quit') {
        ui.screen.destroy();
        process.exit(0);
    }

    let initialState;
    if (startResult.action === 'new') {
        initialState = initGameState(startResult.playerName);
    } else {
        const loaded = await storage.load(startResult.slotId);
        initialState = loaded ?? initGameState('Stranger');
    }

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
        stateManager: new StateManager(initialState),
        conversationManager: new ConversationManager(),
        storage,
        providerLabel,
        narrate: async (prompt: string): Promise<void> => {
            let streamingStarted = false;

            const callbacks: AgentCallbacks = {
                onText: (chunk: string) => {
                    if (!streamingStarted) {
                        ui.narrative.clearThinking();
                        streamingStarted = true;
                    }
                    ui.narrative.stream(chunk);
                },
                onStateUpdate: (state) => {
                    ui.sidebar.update(state);
                    // Print room header as soon as the move tool commits,
                    // before the LLM starts streaming narration.
                    const currentRoomId = state.player.currentRoomId;
                    if (currentRoomId !== previousRoomId) {
                        const room = state.world.rooms[currentRoomId];
                        if (room) Print.RoomHeader(room.name);
                        previousRoomId = currentRoomId;
                    }
                },
                onDialogueChoices: async (_npcId, prompt, choices) => {
                    ui.input.block();
                    const idx = await ui.modals.dialogue.show(prompt, choices);
                    ui.input.unblock();
                    return idx;
                },
            };

            ui.narrative.showThinking();

            try {
                const historyMessages = ctx.conversationManager.getMessagesForAgent();
                const { narration, turnMessages, playerDefeated } = await runTurn(
                    prompt,
                    ctx.stateManager,
                    llmClient,
                    systemPrompt,
                    tools,
                    historyMessages,
                    callbacks,
                );
                ui.narrative.flushStream();
                ctx.conversationManager.appendTurn(turnMessages);

                if (ctx.conversationManager.shouldCompress()) {
                    ctx.conversationManager.compressAsync(llmClient, systemPrompt);
                }

                // narration was already streamed chunk by chunk;
                // only append if the provider doesn't support streaming (fallback)
                if (narration && !streamingStarted) {
                    Print.Message(narration);
                }

                ui.sidebar.update(ctx.stateManager.getState());

                // ── Player death ──────────────────────────────────────────────────
                if (playerDefeated) {
                    ui.input.block();
                    const choice = await ui.modals.death.show();
                    ui.input.unblock();

                    if (choice === 'load') {
                        ui.input.block();
                        const slotId = await ui.modals.startMenu.showLoadList(ctx.storage);
                        ui.input.unblock();

                        if (slotId) {
                            const loaded = await ctx.storage.load(slotId);
                            if (loaded) {
                                ctx.stateManager = new StateManager(loaded);
                                ctx.conversationManager.reset();
                                const newState = ctx.stateManager.getState();
                                previousRoomId = newState.player.currentRoomId;
                                ui.sidebar.update(newState);
                                const room = newState.world.rooms[newState.player.currentRoomId];
                                if (room) Print.RoomHeader(room.name);
                                Print.Message(
                                    'You wake, the memory of death still sharp. The world is as you left it.',
                                );
                            }
                        } else {
                            Print.Message('No saves found. The adventure ends here.');
                            ui.screen.destroy();
                            process.exit(0);
                        }
                    } else {
                        ui.screen.destroy();
                        process.exit(0);
                    }
                }
            } catch (err) {
                ui.narrative.flushStream();
                Print.Message(`[Error] ${err instanceof Error ? err.message : String(err)}`);
            }
        },
    };

    registerBuiltins(registry);

    // ── Auto-save helper ──────────────────────────────────────────────────────
    const autoSave = async () => {
        const state = ctx.stateManager.getState();
        const slotId = state.player.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
        await ctx.storage.save(slotId, state);
    };

    // ── Keyboard shortcuts — wired via InputBar callbacks ─────────────────────
    // These fire from the InputBar's keypress handler only when the buffer is
    // empty, so they never conflict with typing.

    ui.input.onOpenMenu = async () => {
        ui.input.block();
        const choice = await ui.modals.system.show();
        ui.input.unblock();
        if (choice === 'save') {
            await autoSave();
            const slotId = ctx.stateManager
                .getState()
                .player.name.toLowerCase()
                .replace(/[^a-z0-9]/g, '_');
            Print.Message(`Game saved (slot: ${slotId}).`);
        } else if (choice === 'load') {
            ui.input.block();
            const slotId = await ui.modals.startMenu.showLoadList(storage);
            ui.input.unblock();
            if (slotId) {
                await autoSave(); // preserve current state before loading
                const loaded = await ctx.storage.load(slotId);
                if (loaded) {
                    ctx.stateManager = new StateManager(loaded);
                    ctx.conversationManager.reset();
                    Print.Message(`Loaded save: ${slotId}.`);
                    ui.sidebar.update(ctx.stateManager.getState());
                } else {
                    Print.Message('Could not load that save.');
                }
            }
        } else if (choice === 'quit') {
            ui.screen.destroy();
            process.exit(0);
        }
    };

    ui.input.onOpenInventory = async () => {
        ui.input.block();
        await ui.modals.inventory.show(ctx.stateManager.getState());
        ui.input.unblock();
    };

    // ── Print starting room header and initial sidebar ────────────────────────
    const startingState = ctx.stateManager.getState();
    const initialRoomId = startingState.player.currentRoomId;
    const initialRoom = startingState.world.rooms[initialRoomId];
    if (initialRoom) Print.RoomHeader(initialRoom.name);
    previousRoomId = initialRoomId;
    ui.sidebar.update(startingState);

    await ctx.narrate(
        'Narrate the opening scene. Describe the setting, atmosphere, and immediate surroundings to draw the player in.',
    );

    // ── Game loop ─────────────────────────────────────────────────────────────
    while (true) {
        const input = await getUserInput();
        if (!input.trim()) continue; // skip empty (e.g. Escape with empty buffer)
        ui.narrative.append('\n{right}{cyan-fg}' + input + '{/cyan-fg}{/right}\n');
        if (await registry.dispatch(input, ctx)) continue;
        await ctx.narrate(input);
        await autoSave();
    }
}

main();
