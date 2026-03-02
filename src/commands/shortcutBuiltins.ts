import { ShortcutRegistry, ShortcutContext } from './ShortcutRegistry';
import { StateManager } from '../engine/state/StateManager';
import { initGameState } from '../initGameState';
import { Print } from '../utils';

export const SYNTHETIC_OPEN = '\x00';

async function quickSave(ctx: ShortcutContext): Promise<void> {
    const state = ctx.stateManager.getState();
    const slotId = state.player.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    await ctx.storage.save(slotId, state);
    ctx.block();
    await ctx.modals.saveConfirm.show(`Game saved (slot: ${slotId}).`);
    ctx.unblock();
}

function quickQuit(): never {
    process.exit(0);
}

export function registerShortcutBuiltins(registry: ShortcutRegistry): void {
    // Escape (empty buffer) → system menu
    registry.register({ name: 'escape' }, 'Open system menu', async (ctx: ShortcutContext) => {
        ctx.block();
        const choice = await ctx.modals.system.show();
        ctx.unblock();
        if (choice === 'save') {
            await quickSave(ctx);
        } else if (choice === 'load') {
            ctx.block();
            const slotId = await ctx.modals.startMenu.showLoadList(ctx.storage);
            ctx.unblock();
            if (slotId) {
                const state = ctx.stateManager.getState();
                const curSlot = state.player.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
                await ctx.storage.save(curSlot, state);
                const loaded = await ctx.storage.load(slotId);
                if (loaded) {
                    ctx.stateManager = new StateManager(loaded);
                    ctx.conversationManager.reset();
                    Print.Message(`Loaded save: ${slotId}.`);
                    ctx.sidebar.update(ctx.stateManager.getState());
                } else {
                    Print.Message('Could not load that save.');
                }
            }
        } else if (choice === 'quit') {
            quickQuit();
        }
    });

    // Tab → inventory
    registry.register({ name: 'tab' }, 'Open inventory', async (ctx: ShortcutContext) => {
        ctx.block();
        await ctx.modals.inventory.show(ctx.stateManager.getState());
        ctx.unblock();
    });

    // Ctrl+S → quick-save
    registry.register({ name: 's', ctrl: true }, 'Quick-save', quickSave);

    // Ctrl+Q → quick-quit
    registry.register({ name: 'q', ctrl: true }, 'Quit', quickQuit);

    // Ctrl+N → new game (confirmation + name prompt, then synthetic open)
    registry.register({ name: 'n', ctrl: true }, 'Start new game', async (ctx: ShortcutContext) => {
        ctx.block();
        const playerName = await ctx.modals.startMenu.showNewGamePrompt();
        if (!playerName) {
            ctx.unblock();
            return;
        }

        // Auto-save current state before resetting
        const cur = ctx.stateManager.getState();
        const curSlot = cur.player.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
        await ctx.storage.save(curSlot, cur);

        // Reset to fresh state
        ctx.stateManager = new StateManager(initGameState(playerName));
        ctx.conversationManager.reset();
        const newState = ctx.stateManager.getState();
        ctx.setPreviousRoomId(newState.player.currentRoomId);
        ctx.sidebar.update(newState);
        const room = newState.world.rooms[newState.player.currentRoomId];
        if (room) Print.RoomHeader(room.name);

        // Wake the game loop with a synthetic opening prompt (no echo, no dispatch)
        ctx.resolveWith(SYNTHETIC_OPEN);
    });
}
