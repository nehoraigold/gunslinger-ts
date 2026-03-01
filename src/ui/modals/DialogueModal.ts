// @ts-ignore
import blessed from 'blessed';
import { BlessedScreen } from '../screen';

export class DialogueModal {
    constructor(private readonly screen: BlessedScreen) {}

    /**
     * Show arrow-key selection modal for dialogue choices.
     * Returns the 0-based index of the selected choice.
     */
    show(prompt: string, choices: string[]): Promise<number> {
        return new Promise((resolve) => {
            const height = Math.min(choices.length + 6, 24);

            const modal = blessed.box({
                parent: this.screen,
                top: 'center',
                left: 'center',
                width: '60%',
                height,
                label: ' DIALOGUE ',
                border: { type: 'line' },
                style: {
                    border: { fg: 'yellow' },
                    label: { bold: true, fg: 'yellow' },
                },
            });

            blessed.text({
                parent: modal,
                top: 0,
                left: 1,
                width: '100%-4',
                height: 2,
                content: prompt,
                style: { fg: 'white' },
                wrap: true,
                tags: true,
            });

            const list = blessed.list({
                parent: modal,
                top: 3,
                left: 1,
                width: '100%-4',
                height: height - 5,
                style: {
                    selected: { bg: 'yellow', fg: 'black', bold: true },
                    item: { fg: 'white' },
                },
                keys: true,
                vi: true,
                mouse: true,
                items: choices,
            });

            list.focus();
            this.screen.render();

            list.on('select', (_item: unknown, index: number) => {
                modal.destroy();
                this.screen.render();
                resolve(index);
            });

            // No escape — the player must choose
        });
    }
}
