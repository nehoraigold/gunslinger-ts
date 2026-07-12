import { GameState, ItemId, ShopState } from '../../../engine/state';
import { DeepReadonly } from '../../../utils/types';
import { ChoiceProvider, OfferedChoice } from './ChoiceProvider';

export class ShopChoiceProvider implements ChoiceProvider {
    compute(state: DeepReadonly<GameState>): OfferedChoice[] {
        const npcId = state.player.conversationPartnerNpcId;
        const shop = npcId ? state.npcs[npcId]?.shop : undefined;
        if (!npcId || !shop) {
            return [];
        }
        return [...this.buyChoices(state, npcId, shop), ...this.sellChoices(state, npcId, shop)];
    }

    private buyChoices(state: DeepReadonly<GameState>, npcId: string, shop: DeepReadonly<ShopState>): OfferedChoice[] {
        return Object.entries(shop.listings)
            .filter(([itemId, listing]) => listing.forSale && (shop.inventory[itemId] ?? 0) > 0)
            .map(([itemId, listing]) => ({
                choice: { id: `buy:${itemId}`, label: `Buy ${this.itemName(state, itemId)} — ${listing.price}g` },
                invocation: { name: 'buy', args: { npcId, itemId, quantity: 1 } },
            }));
    }

    private sellChoices(state: DeepReadonly<GameState>, npcId: string, shop: DeepReadonly<ShopState>): OfferedChoice[] {
        return Object.entries(state.player.inventory)
            .filter(([itemId]) => shop.buys.includes(state.items[itemId]?.type))
            .map(([itemId]) => ({
                choice: {
                    id: `sell:${itemId}`,
                    label: `Sell ${this.itemName(state, itemId)} — ${state.items[itemId]?.value ?? 0}g`,
                },
                invocation: { name: 'sell', args: { npcId, itemId, quantity: 1 } },
            }));
    }

    private itemName(state: DeepReadonly<GameState>, itemId: ItemId): string {
        return state.items[itemId]?.name ?? itemId;
    }
}
