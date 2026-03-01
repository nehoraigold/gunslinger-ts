// @ts-ignore
import blessed from 'blessed';
import { BlessedScreen } from '../screen';

export type DeathMenuChoice = 'load' | 'quit';

const ITEMS: Array<{ label: string; value: DeathMenuChoice }> = [
    { label: 'Load Last Save', value: 'load' },
    { label: 'Quit', value: 'quit' },
];

export class DeathModal {
    constructor(private readonly screen: BlessedScreen) {}

    show(): Promise<DeathMenuChoice> {
        return new Promise((resolve) => {
            const modal = blessed.list({
                parent: this.screen,
                top: 'center',
                left: 'center',
                width: 34,
                height: ITEMS.length + 4,
                label: ' YOU HAVE DIED ',
                border: { type: 'line' },
                style: {
                    border: { fg: 'red' },
                    selected: { bg: 'red', bold: true },
                    item: { fg: 'white' },
                },
                keys: true,
                vi: true,
                mouse: true,
                items: ITEMS.map((i) => i.label),
            });

            modal.focus();
            this.screen.render();

            modal.on('select', (_item: unknown, index: number) => {
                modal.destroy();
                this.screen.render();
                resolve(ITEMS[index]?.value ?? 'quit');
            });
        });
    }
}
