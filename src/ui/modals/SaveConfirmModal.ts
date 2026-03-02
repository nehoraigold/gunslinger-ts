// @ts-ignore
import blessed from 'blessed';
import { BlessedScreen } from '../screen';

export class SaveConfirmModal {
    constructor(private readonly screen: BlessedScreen) {}

    show(message: string): Promise<void> {
        return new Promise((resolve) => {
            const width = Math.max(message.length + 6, 32);

            const modal = blessed.box({
                parent: this.screen,
                top: 'center',
                left: 'center',
                width,
                height: 5,
                label: ' Saved ',
                border: { type: 'line' },
                style: {
                    paddingLeft: 5,
                    border: { fg: 'green' },
                    fg: 'white',
                },
                tags: true,
                keys: true,
                content: `\n${message}`,
            });

            modal.focus();
            this.screen.render();

            let timeoutId: NodeJS.Timeout;
            const dismiss = () => {
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }
                modal.destroy();
                this.screen.render();
                resolve();
            };
            modal.key(['enter', 'return', 'escape'], dismiss);
            timeoutId = setTimeout(dismiss, 2000);
        });
    }
}
