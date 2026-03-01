import { BlessedLog, BlessedScreen } from './screen';

export class NarrativePanel {
    private lines: string[] = [];
    private streamLine = '';
    private thinkingLineIndex = -1;

    constructor(
        private readonly box: BlessedLog,
        private readonly screen: BlessedScreen,
    ) {}

    /** Append a complete block of text (LLM narration, system messages). */
    append(text: string): void {
        this._flushStream();
        const newLines = text.split('\n');
        if (this.thinkingLineIndex >= 0) {
            // Insert before the "Thinking…" indicator so it stays at the bottom
            this.lines.splice(this.thinkingLineIndex, 0, ...newLines);
            this.thinkingLineIndex += newLines.length;
        } else {
            this.lines.push(...newLines);
        }
        this._render();
    }

    /** Push a streaming chunk — accumulates in the current line. */
    stream(chunk: string): void {
        this.streamLine += chunk;
        this._render();
    }

    /** Finalize the current streaming line. */
    flushStream(): void {
        this._flushStream();
        this._render();
    }

    /** Show a subtle "Thinking…" indicator. */
    showThinking(): void {
        this.thinkingLineIndex = this.lines.length;
        this.lines.push('{gray-fg}Thinking…{/gray-fg}');
        this._render();
    }

    /** Remove the "Thinking…" line (called when first token arrives). */
    clearThinking(): void {
        if (this.thinkingLineIndex >= 0 && this.thinkingLineIndex < this.lines.length) {
            this.lines.splice(this.thinkingLineIndex, 1);
            this.thinkingLineIndex = -1;
            this._render();
        }
    }

    private _flushStream(): void {
        if (this.streamLine) {
            this.lines.push(this.streamLine);
            this.streamLine = '';
        }
    }

    private _render(): void {
        const all = this.streamLine ? [...this.lines, this.streamLine] : this.lines;
        this.box.setContent(all.join('\n'));
        this.box.scrollTo(this.box.getScrollHeight());
        this.screen.render();
    }
}
