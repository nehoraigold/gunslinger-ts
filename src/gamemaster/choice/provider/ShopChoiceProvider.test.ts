import { describe, it } from 'mocha';
import { expect } from 'chai';

import { ShopChoiceProvider } from './ShopChoiceProvider';
import { createGameState } from '../../../engine/state/GameState.test.utils';
import { GameState } from '../../../engine/state';

function withConversationPartner(npcId: string): (state: GameState) => void {
    return (state) => {
        state.player.conversationPartnerNpcId = npcId;
    };
}

describe(ShopChoiceProvider.name, () => {
    const provider = new ShopChoiceProvider();

    describe('compute', () => {
        it('should return no choices when there is no conversation partner', () => {
            const state = createGameState();

            expect(provider.compute(state)).to.deep.equal([]);
        });

        it('should return no choices when the conversation partner has no shop', () => {
            const state = createGameState(withConversationPartner('npc_1'));

            expect(provider.compute(state)).to.deep.equal([]);
        });

        it('should offer a buy choice for an in-stock, for-sale item', () => {
            const state = createGameState((s) => {
                withConversationPartner('npc_1')(s);
                s.npcs.npc_1.shop = {
                    inventory: { item_1: 2 },
                    listings: { item_1: { price: 18, forSale: true } },
                    buys: [],
                };
            });

            const choices = provider.compute(state);

            expect(choices).to.deep.equal([
                {
                    choice: { id: 'buy:item_1', label: 'Buy Item 1 — 18g' },
                    invocation: { name: 'buy', args: { npcId: 'npc_1', itemId: 'item_1', quantity: 1 } },
                },
            ]);
        });

        it('should not offer a buy choice when the item is out of stock', () => {
            const state = createGameState((s) => {
                withConversationPartner('npc_1')(s);
                s.npcs.npc_1.shop = {
                    inventory: { item_1: 0 },
                    listings: { item_1: { price: 18, forSale: true } },
                    buys: [],
                };
            });

            expect(provider.compute(state)).to.deep.equal([]);
        });

        it('should not offer a buy choice when the listing is not for sale', () => {
            const state = createGameState((s) => {
                withConversationPartner('npc_1')(s);
                s.npcs.npc_1.shop = {
                    inventory: { item_1: 2 },
                    listings: { item_1: { price: 18, forSale: false } },
                    buys: [],
                };
            });

            expect(provider.compute(state)).to.deep.equal([]);
        });

        it('should offer a sell choice for a carried item whose type the shop buys', () => {
            const state = createGameState((s) => {
                withConversationPartner('npc_1')(s);
                s.npcs.npc_1.shop = { inventory: {}, listings: {}, buys: ['weapon'] };
                s.player.inventory = { item_1: 1 };
            });

            const choices = provider.compute(state);

            expect(choices).to.deep.equal([
                {
                    choice: { id: 'sell:item_1', label: 'Sell Item 1 — 0g' },
                    invocation: { name: 'sell', args: { npcId: 'npc_1', itemId: 'item_1', quantity: 1 } },
                },
            ]);
        });

        it('should not offer a sell choice for a carried item whose type the shop does not buy', () => {
            const state = createGameState((s) => {
                withConversationPartner('npc_1')(s);
                s.npcs.npc_1.shop = { inventory: {}, listings: {}, buys: ['consumable'] };
                s.player.inventory = { item_1: 1 };
            });

            expect(provider.compute(state)).to.deep.equal([]);
        });
    });
});
