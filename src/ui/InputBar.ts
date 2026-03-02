import { BlessedBox, BlessedScreen, BlessedKey } from './screen';

type DispatchFn = (ch: string | null, key: BlessedKey, bufferLength: number) => boolean;

export class InputBar {
    private buffer = '';
    private active = false;
    private pendingResolve: ((value: string) => void) | null = null;
    private _dispatcher: DispatchFn | null = null;

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

    /**
     * Register the shortcut dispatcher. Called once from main.ts after the
     * ShortcutContext is built. The dispatcher returns true if the key was
     * consumed so InputBar skips adding it to the buffer.
     */
    setDispatcher(fn: DispatchFn): void {
        this._dispatcher = fn;
    }

    /**
     * Programmatically resolve the pending read() promise with a synthetic
     * value. Used by shortcuts (e.g. Ctrl+N) that need to wake the game loop
     * without user input. Clears the buffer and deactivates the bar.
     */
    resolveWith(value: string): void {
        const resolve = this.pendingResolve;
        this.pendingResolve = null;
        this.active = false;
        this.buffer = '';
        this._render();
        if (resolve) resolve(value);
    }

    private _setupKeyHandler(): void {
        this.screen.on('keypress', (ch: string | null, key: BlessedKey) => {
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

            // Ctrl+U → clear line
            if (key.name === 'u' && key.ctrl) {
                this.buffer = '';
                this._render();
                return;
            }

            // Escape with non-empty buffer → clear buffer only
            if (key.name === 'escape' && this.buffer.length > 0) {
                this.buffer = '';
                this._render();
                return;
            }

            // Delegate to shortcut dispatcher (handles Escape+empty, Tab, Ctrl+S, Ctrl+N, …)
            if (this._dispatcher?.(ch, key, this.buffer.length)) return;

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
