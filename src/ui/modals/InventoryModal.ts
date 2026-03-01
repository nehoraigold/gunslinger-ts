// @ts-ignore
import blessed from 'blessed';
import { BlessedScreen } from '../screen';
import { GameState } from '../../engine/state/GameState';

export class InventoryModal {
    constructor(private readonly screen: BlessedScreen) {}

    show(state: GameState): Promise<void> {
        return new Promise((resolve) => {
            const { player, world } = state;

            const entries = Object.entries(player.inventory)
                .filter(([, qty]) => qty > 0)
                .map(([id, qty]) => {
                    const item = world.items[id];
                    const name = item?.name ?? id;
                    const equipped = player.equippedWeapon === id ? ' [W]' : player.equippedArmor === id ? ' [A]' : '';
                    return `${name}${equipped} ×${qty}`;
                });

            const items = entries.length > 0 ? entries : ['(empty)'];

            const modal = blessed.list({
                parent: this.screen,
                top: 'center',
                left: 'center',
                width: '50%',
                height: Math.min(items.length + 4, 20),
                label: ' INVENTORY ',
                border: { type: 'line' },
                style: {
                    border: { fg: 'white' },
                    selected: { bg: 'blue', bold: true },
                    item: { fg: 'white' },
                },
                keys: true,
                vi: true,
                mouse: true,
                items,
            });

            modal.focus();
            this.screen.render();

            const close = () => {
                modal.destroy();
                this.screen.render();
                resolve();
            };

            modal.key(['escape', 'i', 'q'], close);
            // Select does nothing in this read-only view
            modal.on('select', close);
        });
    }
}
