import { describe, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';

import { SellAction } from './SellAction';
import { Context } from '../../context';
import { TradeService } from '../../service/trade/TradeService';
import { SellOutcome } from '../../service/trade/TradeOutcome';
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

function serviceReturning(outcome: SellOutcome): TradeService {
    return { buy: sinon.stub(), sell: sinon.stub().returns(outcome) };
}

describe(SellAction.name, () => {
    const input = { npcId: 'merchant', itemId: 'potion', quantity: 1 };

    it('should fail with not_here when the npc is not in the current room', () => {
        const action = new SellAction(() => serviceReturning({ type: 'notInterested' }));

        const outcome = action.execute(createContext({ inRoom: false }), input);

        expect(outcome).to.deep.equal({ result: 'failure', reason: 'not_here', message: undefined });
    });

    it('should fail with not_a_merchant when the npc has no shop', () => {
        const action = new SellAction(() => serviceReturning({ type: 'notInterested' }));

        const outcome = action.execute(createContext({ shop: undefined }), input);

        expect(outcome).to.deep.equal({ result: 'failure', reason: 'not_a_merchant', message: undefined });
    });

    it('should succeed and surface the trade data when the sale goes through', () => {
        const action = new SellAction(() =>
            serviceReturning({ type: 'traded', itemId: 'potion', quantity: 2, totalPrice: 8 }),
        );

        const outcome = action.execute(createContext(), { npcId: 'merchant', itemId: 'potion', quantity: 2 });

        expect(outcome).to.deep.equal({ result: 'success', data: { itemId: 'potion', quantity: 2, totalPrice: 8 } });
    });

    it('should pass the item, shop, player, and quantity to the trade service', () => {
        const service = serviceReturning({ type: 'traded', itemId: 'potion', quantity: 3, totalPrice: 12 });
        const action = new SellAction(() => service);

        action.execute(createContext(), { npcId: 'merchant', itemId: 'potion', quantity: 3 });

        expect((service.sell as sinon.SinonStub).calledWith('potion', SHOP, PLAYER, 3)).to.be.true;
    });

    const cases: Array<[SellOutcome['type'], string]> = [
        ['notInterested', 'not_interested'],
        ['sellerHasNone', 'not_owned'],
        ['merchantCannotAfford', 'merchant_cannot_afford'],
        ['alreadyAtCapacity', 'merchant_full'],
    ];
    cases.forEach(([outcomeType, reason]) => {
        it(`should translate a ${outcomeType} outcome into a ${reason} failure`, () => {
            const action = new SellAction(() => serviceReturning({ type: outcomeType } as SellOutcome));

            const outcome = action.execute(createContext(), input);

            expect(outcome).to.deep.equal({ result: 'failure', reason, message: undefined });
        });
    });

    describe('schema', () => {
        const action = new SellAction();

        it('should reject input missing the item id', () => {
            expect(() => action.schema.parse({ npcId: 'merchant' })).to.throw(ParseError);
        });

        it('should reject a non-positive quantity', () => {
            expect(() => action.schema.parse({ npcId: 'merchant', itemId: 'potion', quantity: -1 })).to.throw(
                ParseError,
            );
        });
    });
});
