import { describe, it } from 'mocha';
import { expect } from 'chai';

import { DefaultNpc } from './DefaultNpc';
import { RootValueStore } from '../../store';
import { NpcState } from '../../state';

describe(DefaultNpc.name, () => {
    function createDefaultNpc(state?: Partial<NpcState>): DefaultNpc {
        const store = new RootValueStore<NpcState>({
            name: 'Old Marshal',
            appearance: 'A weathered lawman with a tin star and a limp.',
            dialogue: 'Trouble follows you, stranger.',
            money: 0,
            mood: 'neutral',
            health: 10,
            inventory: {},
            ...state,
        });
        return new DefaultNpc('marshal', store);
    }

    describe('id', () => {
        it('should return the id of the npc', () => {
            const npc = createDefaultNpc();

            expect(npc.id).to.equal('marshal');
        });
    });

    describe('name', () => {
        it('should return the name from the npc state', () => {
            const npc = createDefaultNpc({ name: 'Old Marshal' });

            expect(npc.name).to.equal('Old Marshal');
        });
    });

    describe('appearance', () => {
        it('should return the appearance from the npc state', () => {
            const npc = createDefaultNpc({ appearance: 'A weathered lawman.' });

            expect(npc.appearance).to.equal('A weathered lawman.');
        });
    });

    describe('dialogue', () => {
        it('should return the dialogue line from the npc state', () => {
            const npc = createDefaultNpc({ dialogue: 'Trouble follows you, stranger.' });

            expect(npc.dialogue).to.equal('Trouble follows you, stranger.');
        });
    });

    describe('mood', () => {
        it('should return the mood from the npc state', () => {
            const npc = createDefaultNpc({ mood: 'hostile' });

            expect(npc.mood).to.equal('hostile');
        });
    });

    describe('isAlive', () => {
        it('should be alive when health is above zero', () => {
            expect(createDefaultNpc({ health: 3 }).isAlive()).to.be.true;
        });

        it('should not be alive when health is zero', () => {
            expect(createDefaultNpc({ health: 0 }).isAlive()).to.be.false;
        });
    });

    describe('wallet', () => {
        it('should reflect the money held in npc state', () => {
            const npc = createDefaultNpc({ money: 30 });

            expect(npc.wallet().balance()).to.equal(30);
        });

        it('should persist changes made through the returned wallet back into npc state', () => {
            const npc = createDefaultNpc({ money: 30 });

            npc.wallet().debit(12);

            expect(npc.wallet().balance()).to.equal(18);
        });
    });

    describe('inventory', () => {
        it('should reflect the quantities held in npc state', () => {
            const npc = createDefaultNpc({ inventory: { rifle: 2 } });

            expect(npc.inventory().quantityOf('rifle')).to.equal(2);
        });

        it('should persist changes made through the returned inventory back into npc state', () => {
            const npc = createDefaultNpc();

            npc.inventory().add('rifle');

            expect(npc.inventory().quantityOf('rifle')).to.equal(1);
        });
    });

    describe('shop', () => {
        it('should return undefined when the npc is not a merchant', () => {
            expect(createDefaultNpc().shop()).to.be.undefined;
        });

        it('should expose a shop backed by the npc shop state when present', () => {
            const npc = createDefaultNpc({
                shop: {
                    inventory: { rifle: 2 },
                    listings: { rifle: { price: 8, forSale: true } },
                    buys: ['weapon'],
                },
            });

            const shop = npc.shop();

            expect(shop?.priceOf('rifle')).to.equal(8);
            expect(shop?.inventory().quantityOf('rifle')).to.equal(2);
        });

        it('should draw the shop purse from the npc money', () => {
            const npc = createDefaultNpc({
                money: 40,
                shop: { inventory: {}, listings: {}, buys: [] },
            });

            expect(npc.shop()?.wallet().balance()).to.equal(40);
        });
    });
});
