// @ts-ignore
import blessed from 'blessed';
import { BlessedScreen } from '../screen';

export type SystemMenuChoice = 'continue' | 'save' | 'load' | 'quit';

const ITEMS: Array<{ label: string; value: SystemMenuChoice }> = [
    { label: 'Continue', value: 'continue' },
    { label: 'Save', value: 'save' },
    { label: 'Load', value: 'load' },
    { label: 'Quit', value: 'quit' },
];

export class SystemMenu {
    constructor(private readonly screen: BlessedScreen) {}

    show(): Promise<SystemMenuChoice> {
        return new Promise((resolve) => {
            const modal = blessed.list({
                parent: this.screen,
                top: 'center',
                left: 'center',
                width: 30,
                height: ITEMS.length + 4,
                label: ' MENU ',
                border: { type: 'line' },
                style: {
                    border: { fg: 'white' },
                    selected: { bg: 'blue', bold: true },
                    item: { fg: 'white' },
                },
                keys: true,
                vi: true,
                mouse: true,
                items: ITEMS.map((i) => i.label),
            });

            modal.focus();
            this.screen.render();

            const cleanup = (choice: SystemMenuChoice) => {
                modal.destroy();
                this.screen.render();
                resolve(choice);
            };

            modal.on('select', (_item: unknown, index: number) => {
                cleanup(ITEMS[index]?.value ?? 'continue');
            });

            modal.key(['escape', 'q'], () => cleanup('continue'));
        });
    }
}
