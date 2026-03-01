// @ts-ignore
import blessed from 'blessed';
import { BlessedScreen } from '../screen';
import { GameState } from '../../engine/state/GameState';
import { isAlive } from '../../engine/npc/npcUtils';

export class TradeModal {
    constructor(private readonly screen: BlessedScreen) {}

    /** Show two-column trade layout. Returns when the player closes the modal. */
    show(state: GameState, npcId: string): Promise<void> {
        return new Promise((resolve) => {
            const { player, world } = state;
            const npc = world.npcs[npcId];

            if (!npc || !isAlive(npc)) {
                resolve();
                return;
            }

            const modal = blessed.box({
                parent: this.screen,
                top: 'center',
                left: 'center',
                width: '80%',
                height: '70%',
                label: ` Trade with ${npc.name} `,
                border: { type: 'line' },
                style: {
                    border: { fg: 'yellow' },
                    label: { bold: true, fg: 'yellow' },
                },
            });

            // Player column
            const playerItems = Object.entries(player.inventory)
                .filter(([, qty]) => qty > 0)
                .map(([id, qty]) => {
                    const item = world.items[id];
                    return `${item?.name ?? id} ×${qty}`;
                });

            blessed.list({
                parent: modal,
                top: 0,
                left: 0,
                width: '50%',
                height: '100%-2',
                label: ' Your Items ',
                border: { type: 'line' },
                style: {
                    border: { fg: 'white' },
                    selected: { bg: 'blue', bold: true },
                    item: { fg: 'white' },
                },
                keys: false,
                items: playerItems.length > 0 ? playerItems : ['(empty)'],
            });

            // NPC column
            const npcItems = (npc.inventory ?? []).map((entry) => {
                const item = world.items[entry.itemId];
                return `${item?.name ?? entry.itemId} ×${entry.quantity}`;
            });

            const npcList = blessed.list({
                parent: modal,
                top: 0,
                left: '50%',
                width: '50%',
                height: '100%-2',
                label: ` ${npc.name}'s Items `,
                border: { type: 'line' },
                style: {
                    border: { fg: 'white' },
                    selected: { bg: 'blue', bold: true },
                    item: { fg: 'white' },
                },
                keys: true,
                vi: true,
                mouse: true,
                items: npcItems.length > 0 ? npcItems : ['(empty)'],
            });

            npcList.focus();
            this.screen.render();

            const close = () => {
                modal.destroy();
                this.screen.render();
                resolve();
            };

            npcList.key(['escape', 'q'], close);
        });
    }
}
