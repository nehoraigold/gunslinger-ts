// @ts-ignore
import blessed from 'blessed';
import { BlessedScreen } from '../screen';
import { GameStorage, SlotInfo } from '../../engine/meta/GameStorage';

export type StartMenuResult =
    | { action: 'new'; playerName: string }
    | { action: 'load'; slotId: string }
    | { action: 'quit' };

const MAIN_ITEMS = ['New Game', 'Load Game', 'Quit'] as const;

function formatSlot(info: SlotInfo): string {
    const date = info.savedAt instanceof Date ? info.savedAt : new Date(info.savedAt);
    const dateStr = date.toLocaleDateString();
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${info.slotId}  •  Turn ${info.turnCount}  •  ${dateStr} ${timeStr}`;
}

export class StartMenu {
    constructor(private readonly screen: BlessedScreen) {}

    /** Show the full start menu flow. Resolves when the user has made a final choice. */
    show(storage: GameStorage): Promise<StartMenuResult> {
        return new Promise((resolve) => {
            this.showMainMenu(storage, resolve);
        });
    }

    /**
     * Show just the load-game list (Phase C). Used by the system menu mid-game.
     * Returns the chosen slotId, or null if the user cancelled.
     */
    showLoadList(storage: GameStorage): Promise<string | null> {
        return new Promise((resolve) => {
            this.showLoadPhase(
                storage,
                (slotId) => resolve(slotId),
                () => resolve(null),
            );
        });
    }

    // ── Phase A: Main menu ─────────────────────────────────────────────────────

    private showMainMenu(storage: GameStorage, resolve: (r: StartMenuResult) => void): void {
        const modal = blessed.list({
            parent: this.screen,
            top: 'center',
            left: 'center',
            width: 36,
            height: MAIN_ITEMS.length + 4,
            label: ' GUNSLINGER ',
            border: { type: 'line' },
            style: {
                border: { fg: 'yellow' },
                selected: { bg: 'blue', bold: true },
                item: { fg: 'white' },
            },
            keys: true,
            vi: true,
            mouse: true,
            items: MAIN_ITEMS as unknown as string[],
        });

        modal.focus();
        this.screen.render();

        modal.on('select', (_item: unknown, index: number) => {
            modal.destroy();
            this.screen.render();

            if (index === 0) {
                this.showNewGamePhase(resolve);
            } else if (index === 1) {
                this.showLoadPhase(
                    storage,
                    (slotId) => resolve({ action: 'load', slotId }),
                    () => this.showMainMenu(storage, resolve),
                );
            } else {
                resolve({ action: 'quit' });
            }
        });

        // No escape handler on the root menu — there's nowhere to cancel back to,
        // and handling escape here would cause the same event to re-trigger the
        // newly created modal (blessed event propagation).
    }

    // ── Phase B: New Game name prompt ──────────────────────────────────────────

    private showNewGamePhase(resolve: (r: StartMenuResult) => void): void {
        const prompt = blessed.prompt({
            parent: this.screen,
            top: 'center',
            left: 'center',
            width: 40,
            height: 7,
            label: ' New Game ',
            border: { type: 'line' },
            style: {
                border: { fg: 'green' },
                fg: 'white',
            },
        });

        prompt.input('Enter your name:', '', (_err: unknown, value: string | undefined) => {
            prompt.destroy();
            this.screen.render();

            const name = (value ?? '').trim();
            if (!name) {
                // Re-prompt if empty
                this.showNewGamePhase(resolve);
                return;
            }
            resolve({ action: 'new', playerName: name });
        });

        this.screen.render();
    }

    // ── Phase C: Load game list ────────────────────────────────────────────────

    private showLoadPhase(storage: GameStorage, onSelect: (slotId: string) => void, onCancel: () => void): void {
        storage.listSavesWithMeta().then((saves) => {
            if (saves.length === 0) {
                const msg = blessed.message({
                    parent: this.screen,
                    top: 'center',
                    left: 'center',
                    width: 30,
                    height: 5,
                    label: ' Load Game ',
                    border: { type: 'line' },
                    style: { border: { fg: 'white' }, fg: 'white' },
                });

                msg.display('No saves found.', 2, () => {
                    msg.destroy();
                    this.screen.render();
                    onCancel();
                });

                this.screen.render();
                return;
            }

            const modal = blessed.list({
                parent: this.screen,
                top: 'center',
                left: 'center',
                width: 60,
                height: Math.min(saves.length + 4, 16),
                label: ' Load Game ',
                border: { type: 'line' },
                style: {
                    border: { fg: 'cyan' },
                    selected: { bg: 'blue', bold: true },
                    item: { fg: 'white' },
                },
                keys: true,
                vi: true,
                mouse: true,
                scrollable: true,
                items: saves.map(formatSlot),
            });

            modal.focus();
            this.screen.render();

            modal.on('select', (_item: unknown, index: number) => {
                const save = saves[index];
                modal.destroy();
                this.screen.render();
                if (save) onSelect(save.slotId);
            });

            modal.key(['escape'], () => {
                modal.destroy();
                this.screen.render();
                // Defer until after the current keypress event finishes propagating,
                // otherwise the newly created modal would receive the same escape event.
                setImmediate(() => onCancel());
            });
        });
    }
}
