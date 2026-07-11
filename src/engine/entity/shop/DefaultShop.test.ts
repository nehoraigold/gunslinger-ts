import { describe, it } from 'mocha';
import { expect } from 'chai';

import { DefaultShop } from './DefaultShop';
import { ShopState } from '../../state';
import { RootValueStore } from '../../store';
import { DefaultWallet } from '../wallet';

describe(DefaultShop.name, () => {
    function createShop(overrides: Partial<ShopState> = {}) {
        const state: ShopState = {
            inventory: { rifle: 2, potion: 5 },
            listings: { rifle: { price: 8, forSale: true }, relic: { price: 100, forSale: false } },
            buys: ['weapon', 'consumable'],
            ...overrides,
        };
        const store = new RootValueStore(state);
        let money = 50;
        const wallet = new DefaultWallet(
            () => money,
            (next) => {
                money = next;
            },
        );
        return { shop: new DefaultShop(store, wallet), store };
    }

    describe('priceOf', () => {
        it('should return the listed price of an item', () => {
            expect(createShop().shop.priceOf('rifle')).to.equal(8);
        });

        it('should return undefined for an unlisted item', () => {
            expect(createShop().shop.priceOf('unknown')).to.be.undefined;
        });
    });

    describe('isForSale', () => {
        it('should be true for a listed, for-sale item', () => {
            expect(createShop().shop.sells('rifle')).to.be.true;
        });

        it('should be false for a listed item not for sale', () => {
            expect(createShop().shop.sells('relic')).to.be.false;
        });

        it('should be false for an unlisted item', () => {
            expect(createShop().shop.sells('unknown')).to.be.false;
        });
    });

    describe('buys', () => {
        it('should be true for an item type the merchant wants', () => {
            expect(createShop().shop.buys('weapon')).to.be.true;
        });

        it('should be false for an item type the merchant does not want', () => {
            expect(createShop().shop.buys('armor')).to.be.false;
        });
    });

    describe('inventory', () => {
        it('should reflect the stock quantities', () => {
            expect(createShop().shop.inventory().quantityOf('rifle')).to.equal(2);
        });

        it('should persist changes back into shop state', () => {
            const { shop, store } = createShop();
            shop.inventory().remove('rifle', 1);
            expect(store.get().inventory.rifle).to.equal(1);
        });
    });

    describe('wallet', () => {
        it('should expose the merchant purse balance', () => {
            expect(createShop().shop.wallet().balance()).to.equal(50);
        });
    });
});
