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
    async show(storage: GameStorage): Promise<StartMenuResult> {
        while (true) {
            const index = await this._showMainMenuOnce();

            if (index === 0) {
                const name = await this._showNewGameOnce();
                if (name !== null) return { action: 'new', playerName: name };
                // name is null when user cancelled (empty input) — loop back
            } else if (index === 1) {
                const slotId = await this._showLoadOnce(storage);
                if (slotId !== null) return { action: 'load', slotId };
                // slotId is null when user pressed Escape — loop back
            } else {
                return { action: 'quit' };
            }
        }
    }

    /**
     * Show just the load-game list. Used by the system menu mid-game.
     * Returns the chosen slotId, or null if the user cancelled.
     */
    showLoadList(storage: GameStorage): Promise<string | null> {
        return this._showLoadOnce(storage);
    }

    // ── Phase A: Main menu ─────────────────────────────────────────────────────

    private _showMainMenuOnce(): Promise<number> {
        return new Promise((resolve) => {
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
                items: [...MAIN_ITEMS] as string[],
            });

            modal.focus();
            this.screen.render();

            modal.once('select', (_item: unknown, index: number) => {
                modal.destroy();
                this.screen.render();
                resolve(index);
            });

            // No escape handler — root menu has nowhere to go back to.
        });
    }

    // ── Phase B: New Game name prompt ──────────────────────────────────────────

    private _showNewGameOnce(): Promise<string | null> {
        return new Promise((resolve) => {
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
                // Resolve null on empty/cancelled so the caller can loop back.
                resolve(name || null);
            });

            this.screen.render();
        });
    }

    // ── Phase C: Load game list ────────────────────────────────────────────────

    private _showLoadOnce(storage: GameStorage): Promise<string | null> {
        return new Promise((resolve) => {
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
                        resolve(null);
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

                const escapeHandler = () => {
                    modal.destroy();
                    // Defer so the escape keypress finishes propagating before
                    // any new modal is created by the caller.
                    setImmediate(() => resolve(null));
                };
                modal.onceKey('escape', escapeHandler);

                modal.once('select', (_item: unknown, index: number) => {
                    modal.unkey('escape', escapeHandler);
                    const save = saves[index];
                    modal.destroy();
                    this.screen.render();
                    resolve(save ? save.slotId : null);
                });
            });
        });
    }
}
