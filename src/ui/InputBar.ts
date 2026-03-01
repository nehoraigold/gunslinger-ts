import { BlessedBox, BlessedScreen } from './screen';

export class InputBar {
    /** Called when the user presses Escape with an empty buffer. */
    onOpenMenu?: () => void;
    /** Called when the user presses Tab to open inventory. */
    onOpenInventory?: () => void;

    private buffer = '';
    private active = false;
    private pendingResolve: ((value: string) => void) | null = null;

    constructor(
        private readonly box: BlessedBox,
        private readonly screen: BlessedScreen,
    ) {
        this._setupKeyHandler();
        this._render();
    }

    /** Returns true while accepting keystrokes (not blocked by a modal). */
    get isActive(): boolean {
        return this.active;
    }

    /** Resolve when the user presses Enter. */
    read(): Promise<string> {
        return new Promise((resolve) => {
            this.pendingResolve = resolve;
            this.active = true;
            this._render();
        });
    }

    /** Suspend keystroke capture while a modal is open. */
    block(): void {
        this.active = false;
        this._render();
    }

    /** Resume keystroke capture after a modal closes. */
    unblock(): void {
        if (this.pendingResolve) {
            this.active = true;
            this._render();
        }
    }

    private _setupKeyHandler(): void {
        this.screen.on('keypress', (ch: string | null, key: { name: string; ctrl: boolean; meta: boolean }) => {
            if (!this.active) return;

            if (key.name === 'enter' || key.name === 'return') {
                const text = this.buffer;
                this.buffer = '';
                this._render();
                const resolve = this.pendingResolve;
                this.pendingResolve = null;
                this.active = false;
                if (resolve) resolve(text);
                return;
            }

            if (key.name === 'backspace') {
                this.buffer = this.buffer.slice(0, -1);
                this._render();
                return;
            }

            if (key.name === 'escape') {
                if (this.buffer.length > 0) {
                    // Clear partial input
                    this.buffer = '';
                    this._render();
                } else {
                    // Empty buffer + Escape → system menu
                    this.onOpenMenu?.();
                }
                return;
            }

            // Tab (same as Ctrl+I in terminals) → inventory shortcut
            if (key.name === 'tab') {
                this.onOpenInventory?.();
                return;
            }

            // Ctrl+U → clear line
            if (key.name === 'u' && key.ctrl) {
                this.buffer = '';
                this._render();
            }

            // Regular printable character
            if (ch && !key.ctrl && !key.meta) {
                this.buffer += ch;
                this._render();
            }
        });
    }

    private _render(): void {
        const cursor = this.active ? '{blink}_{/blink}' : '';
        this.box.setContent(`{white-fg}  ${this.buffer}${cursor}{/white-fg}`);
        this.screen.render();
    }
}
