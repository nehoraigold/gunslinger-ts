import { describe, it } from 'mocha';
import { expect } from 'chai';

import { DefaultTradeService } from './DefaultTradeService';
import { ItemId, ItemType, InventoryState, PlayerState, ShopState } from '../../state';
import { Item, DefaultPlayer, DefaultShop, DefaultWallet } from '../../entity';
import { RootValueStore } from '../../store';
import { ItemLookup } from '../inventory/ItemLookup';

type ItemSpec = { type: ItemType; value: number; stackable: boolean };

const ITEMS: Record<ItemId, ItemSpec> = {
    potion: { type: 'consumable', value: 4, stackable: true },
    rifle: { type: 'weapon', value: 5, stackable: false },
    trinket: { type: 'misc', value: 2, stackable: true },
};

function itemLookup(): ItemLookup {
    const build = (id: ItemId): Item => ({
        id,
        name: id,
        description: '',
        type: ITEMS[id].type,
        stackable: ITEMS[id].stackable,
        value: ITEMS[id].value,
        weight: 0,
        takeable: true,
        droppable: true,
    });
    return { item: (id) => (ITEMS[id] ? build(id) : undefined), requireItem: build };
}

function createPlayer(money: number, inventory: InventoryState): DefaultPlayer {
    return new DefaultPlayer(
        new RootValueStore<PlayerState>({
            id: 'player',
            name: 'Roland',
            currentRoomId: 'room_1',
            equipment: { weapon: undefined, armor: undefined },
            inventory,
            money,
        }),
    );
}

function createShop(money: number, state: Partial<ShopState> = {}) {
    let purse = money;
    const wallet = new DefaultWallet(
        () => purse,
        (next) => {
            purse = next;
        },
    );
    const shop = new DefaultShop(
        new RootValueStore<ShopState>({
            inventory: { potion: 3, rifle: 1 },
            listings: {
                potion: { price: 5, forSale: true },
                rifle: { price: 10, forSale: true },
                relic: { price: 100, forSale: false },
            },
            buys: ['weapon', 'consumable'],
            ...state,
        }),
        wallet,
    );
    return { shop, merchantMoney: () => purse };
}

describe(DefaultTradeService.name, () => {
    const service = () => new DefaultTradeService(itemLookup());

    describe('buy', () => {
        it('should move the item and money and decrement stock on success', () => {
            const player = createPlayer(20, {});
            const { shop, merchantMoney } = createShop(50);

            const outcome = service().buy('potion', shop, player);

            expect(outcome).to.deep.equal({ type: 'traded', itemId: 'potion', quantity: 1, totalPrice: 5 });
            expect(player.inventory().quantityOf('potion')).to.equal(1);
            expect(shop.inventory().quantityOf('potion')).to.equal(2);
            expect(player.wallet().balance()).to.equal(15);
            expect(merchantMoney()).to.equal(55);
        });

        it('should charge unit price times quantity for quantity greater than one', () => {
            const player = createPlayer(20, {});
            const { shop, merchantMoney } = createShop(50);

            const outcome = service().buy('potion', shop, player, 2);

            expect(outcome).to.deep.equal({ type: 'traded', itemId: 'potion', quantity: 2, totalPrice: 10 });
            expect(player.wallet().balance()).to.equal(10);
            expect(merchantMoney()).to.equal(60);
            expect(shop.inventory().quantityOf('potion')).to.equal(1);
        });

        it('should conserve total money across a purchase', () => {
            const player = createPlayer(20, {});
            const { shop, merchantMoney } = createShop(50);

            service().buy('potion', shop, player, 2);

            expect(player.wallet().balance() + merchantMoney()).to.equal(70);
        });

        it('should fail with notForSale when the listing is not for sale', () => {
            const player = createPlayer(20, {});
            const { shop } = createShop(50);

            expect(service().buy('relic', shop, player)).to.deep.equal({ type: 'notForSale' });
        });

        it('should fail with outOfStock when quantity exceeds stock', () => {
            const player = createPlayer(20, {});
            const { shop } = createShop(50);

            expect(service().buy('potion', shop, player, 4)).to.deep.equal({ type: 'outOfStock' });
        });

        it('should fail with buyerCannotAfford and mutate nothing when the player is short', () => {
            const player = createPlayer(3, {});
            const { shop, merchantMoney } = createShop(50);

            const outcome = service().buy('potion', shop, player);

            expect(outcome).to.deep.equal({ type: 'buyerCannotAfford' });
            expect(player.wallet().balance()).to.equal(3);
            expect(merchantMoney()).to.equal(50);
            expect(player.inventory().quantityOf('potion')).to.equal(0);
            expect(shop.inventory().quantityOf('potion')).to.equal(3);
        });

        it('should fail with alreadyAtCapacity when buying a non-stackable the player already holds', () => {
            const player = createPlayer(20, { rifle: 1 });
            const { shop } = createShop(50);

            expect(service().buy('rifle', shop, player)).to.deep.equal({ type: 'alreadyAtCapacity' });
        });

        it('should refuse buying more than one of a non-stackable item', () => {
            const player = createPlayer(50, {});
            const { shop } = createShop(50, {
                inventory: { rifle: 2 },
                listings: { rifle: { price: 10, forSale: true } },
            });

            expect(service().buy('rifle', shop, player, 2)).to.deep.equal({ type: 'alreadyAtCapacity' });
        });
    });

    describe('sell', () => {
        it('should move the item and money on success', () => {
            const player = createPlayer(20, { potion: 2 });
            const { shop, merchantMoney } = createShop(50);

            const outcome = service().sell('potion', shop, player);

            expect(outcome).to.deep.equal({ type: 'traded', itemId: 'potion', quantity: 1, totalPrice: 4 });
            expect(player.inventory().quantityOf('potion')).to.equal(1);
            expect(shop.inventory().quantityOf('potion')).to.equal(4);
            expect(player.wallet().balance()).to.equal(24);
            expect(merchantMoney()).to.equal(46);
        });

        it('should conserve total money across a sale', () => {
            const player = createPlayer(20, { potion: 2 });
            const { shop, merchantMoney } = createShop(50);

            service().sell('potion', shop, player, 2);

            expect(player.wallet().balance() + merchantMoney()).to.equal(70);
        });

        it('should fail with notInterested when the merchant does not buy the item type', () => {
            const player = createPlayer(20, { trinket: 1 });
            const { shop } = createShop(50);

            expect(service().sell('trinket', shop, player)).to.deep.equal({ type: 'notInterested' });
        });

        it('should fail with sellerHasNone when quantity exceeds what the player holds', () => {
            const player = createPlayer(20, { potion: 2 });
            const { shop } = createShop(50);

            expect(service().sell('potion', shop, player, 5)).to.deep.equal({ type: 'sellerHasNone' });
        });

        it('should fail with merchantCannotAfford and mutate nothing when the merchant is short', () => {
            const player = createPlayer(20, { potion: 2 });
            const { shop, merchantMoney } = createShop(2);

            const outcome = service().sell('potion', shop, player);

            expect(outcome).to.deep.equal({ type: 'merchantCannotAfford' });
            expect(player.wallet().balance()).to.equal(20);
            expect(merchantMoney()).to.equal(2);
            expect(player.inventory().quantityOf('potion')).to.equal(2);
        });
    });
});
