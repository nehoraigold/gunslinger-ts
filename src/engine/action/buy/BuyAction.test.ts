import { describe, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';

import { BuyAction } from './BuyAction';
import { Context } from '../../context';
import { TradeService } from '../../service/trade/TradeService';
import { BuyOutcome } from '../../service/trade/TradeOutcome';
import { Npc, Player, Room, Shop } from '../../entity';
import { ParseError } from '../../../utils/schema';

const SHOP = {} as Shop;
const PLAYER = {} as Player;

function createContext(opts: { inRoom?: boolean; shop?: Shop } = {}): Context {
    const room = { npcIds: () => (opts.inRoom === false ? [] : ['merchant']) } as unknown as Room;
    const npc = { shop: () => ('shop' in opts ? opts.shop : SHOP) } as unknown as Npc;
    return {
        requireCurrentRoom: () => room,
        requireNpc: () => npc,
        player: () => PLAYER,
    } as unknown as Context;
}

function serviceReturning(outcome: BuyOutcome): TradeService {
    return { buy: sinon.stub().returns(outcome), sell: sinon.stub() };
}

describe(BuyAction.name, () => {
    const input = { npcId: 'merchant', itemId: 'potion', quantity: 1 };

    it('should fail with not_here when the npc is not in the current room', () => {
        const action = new BuyAction(() => serviceReturning({ type: 'notForSale' }));

        const outcome = action.execute(createContext({ inRoom: false }), input);

        expect(outcome).to.deep.equal({ result: 'failure', reason: 'not_here', message: undefined });
    });

    it('should fail with not_a_merchant when the npc has no shop', () => {
        const action = new BuyAction(() => serviceReturning({ type: 'notForSale' }));

        const outcome = action.execute(createContext({ shop: undefined }), input);

        expect(outcome).to.deep.equal({ result: 'failure', reason: 'not_a_merchant', message: undefined });
    });

    it('should succeed and surface the trade data when the purchase goes through', () => {
        const action = new BuyAction(() =>
            serviceReturning({ type: 'traded', itemId: 'potion', quantity: 2, totalPrice: 10 }),
        );

        const outcome = action.execute(createContext(), { npcId: 'merchant', itemId: 'potion', quantity: 2 });

        expect(outcome).to.deep.equal({ result: 'success', data: { itemId: 'potion', quantity: 2, totalPrice: 10 } });
    });

    it('should pass the item, shop, player, and quantity to the trade service', () => {
        const service = serviceReturning({ type: 'traded', itemId: 'potion', quantity: 3, totalPrice: 15 });
        const action = new BuyAction(() => service);

        action.execute(createContext(), { npcId: 'merchant', itemId: 'potion', quantity: 3 });

        expect((service.buy as sinon.SinonStub).calledWith('potion', SHOP, PLAYER, 3)).to.be.true;
    });

    const cases: Array<[BuyOutcome['type'], string]> = [
        ['notForSale', 'not_for_sale'],
        ['outOfStock', 'out_of_stock'],
        ['buyerCannotAfford', 'cannot_afford'],
        ['alreadyAtCapacity', 'cannot_carry'],
    ];
    cases.forEach(([outcomeType, reason]) => {
        it(`should translate a ${outcomeType} outcome into a ${reason} failure`, () => {
            const action = new BuyAction(() => serviceReturning({ type: outcomeType } as BuyOutcome));

            const outcome = action.execute(createContext(), input);

            expect(outcome).to.deep.equal({ result: 'failure', reason, message: undefined });
        });
    });

    describe('schema', () => {
        const action = new BuyAction();

        it('should reject input missing the item id', () => {
            expect(() => action.schema.parse({ npcId: 'merchant' })).to.throw(ParseError);
        });

        it('should reject a non-positive quantity', () => {
            expect(() => action.schema.parse({ npcId: 'merchant', itemId: 'potion', quantity: 0 })).to.throw(
                ParseError,
            );
        });

        it('should accept input without a quantity', () => {
            expect(action.schema.parse({ npcId: 'merchant', itemId: 'potion' })).to.deep.equal({
                npcId: 'merchant',
                itemId: 'potion',
            });
        });
    });
});
