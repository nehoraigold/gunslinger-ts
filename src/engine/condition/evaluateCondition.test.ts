import { describe, it } from 'mocha';
import { expect } from 'chai';

import { evaluateCondition } from './evaluateCondition';
import { Condition } from './Condition';
import { Context, GameContext } from '../context';
import { GameTransaction } from '../transaction';
import { createGameState, ModifyState } from '../state/GameState.test.utils';
import { DefaultRoomFactory, DefaultItemFactory, DefaultNpcFactory } from '../entity';

describe('evaluateCondition', () => {
    const factories = {
        room: new DefaultRoomFactory(),
        item: new DefaultItemFactory(),
        npc: new DefaultNpcFactory(),
    };

    const contextWith = (modifyState?: ModifyState): Context =>
        new GameContext(new GameTransaction(createGameState(modifyState)), factories);

    const evaluate = (condition: Condition, modifyState?: ModifyState): boolean =>
        evaluateCondition(contextWith(modifyState), condition);

    describe('sentinels', () => {
        it('should evaluate true to true and false to false', () => {
            expect(evaluate({ type: 'true' })).to.be.true;
            expect(evaluate({ type: 'false' })).to.be.false;
        });
    });

    describe('flag_eq', () => {
        it('should be true when the flag equals the value', () => {
            const condition: Condition = { type: 'flag_eq', key: 'gate', value: 'open' };

            expect(evaluate(condition, (s) => void (s.flags.gate = 'open'))).to.be.true;
        });

        it('should be false when the flag differs from the value', () => {
            const condition: Condition = { type: 'flag_eq', key: 'gate', value: 'open' };

            expect(evaluate(condition, (s) => void (s.flags.gate = 'shut'))).to.be.false;
        });

        it('should treat a missing flag as satisfied when comparing against a falsy value', () => {
            expect(evaluate({ type: 'flag_eq', key: 'missing', value: false })).to.be.true;
        });

        it('should treat a missing flag as unsatisfied when comparing against a truthy value', () => {
            expect(evaluate({ type: 'flag_eq', key: 'missing', value: true })).to.be.false;
        });
    });

    describe('flag_gte / flag_lte', () => {
        const setGold: ModifyState = (s) => void (s.flags.gold = 5);

        it('should compare a numeric flag', () => {
            expect(evaluate({ type: 'flag_gte', key: 'gold', value: 5 }, setGold)).to.be.true;
            expect(evaluate({ type: 'flag_gte', key: 'gold', value: 6 }, setGold)).to.be.false;
            expect(evaluate({ type: 'flag_lte', key: 'gold', value: 5 }, setGold)).to.be.true;
            expect(evaluate({ type: 'flag_lte', key: 'gold', value: 4 }, setGold)).to.be.false;
        });

        it('should treat a missing flag as 0', () => {
            expect(evaluate({ type: 'flag_gte', key: 'missing', value: 0 })).to.be.true;
            expect(evaluate({ type: 'flag_gte', key: 'missing', value: 1 })).to.be.false;
            expect(evaluate({ type: 'flag_lte', key: 'missing', value: 0 })).to.be.true;
        });

        it('should treat a non-numeric flag as 0', () => {
            expect(evaluate({ type: 'flag_gte', key: 'gate', value: 1 }, (s) => void (s.flags.gate = 'open'))).to.be
                .false;
        });
    });

    describe('has_item / lacks_item', () => {
        const giveItemToPlayer: ModifyState = (s) => void (s.player.inventory.item_1 = 2);

        it('should count items in the player inventory', () => {
            const has = (comparison: 'at_least' | 'exactly' | 'at_most', quantity: number): Condition => ({
                type: 'has_item',
                itemId: 'item_1',
                location: 'player',
                comparison,
                quantity,
            });

            expect(evaluate(has('at_least', 2), giveItemToPlayer)).to.be.true;
            expect(evaluate(has('exactly', 1), giveItemToPlayer)).to.be.false;
            expect(evaluate(has('at_most', 2), giveItemToPlayer)).to.be.true;
        });

        it('should count items in a room, defaulting to the current room when no roomId is given', () => {
            const stock: ModifyState = (s) => void (s.rooms.room_1.inventory.item_2 = 3);
            const condition: Condition = {
                type: 'has_item',
                itemId: 'item_2',
                location: 'room',
                comparison: 'at_least',
                quantity: 3,
            };

            expect(evaluate(condition, stock)).to.be.true;
        });

        it('should treat an unknown room as holding zero of the item', () => {
            const condition: Condition = {
                type: 'has_item',
                itemId: 'item_2',
                location: 'room',
                roomId: 'nowhere',
                comparison: 'at_least',
                quantity: 1,
            };

            expect(evaluate(condition)).to.be.false;
        });

        it('should report lacks_item only when the count is zero', () => {
            const condition: Condition = { type: 'lacks_item', itemId: 'item_1', location: 'player' };

            expect(evaluate(condition)).to.be.true;
            expect(evaluate(condition, giveItemToPlayer)).to.be.false;
        });
    });

    describe('room_visited', () => {
        it('should be true only for a visited room and false for unvisited or unknown rooms', () => {
            expect(evaluate({ type: 'room_visited', roomId: 'room_1' }, (s) => void (s.rooms.room_1.visited = true))).to
                .be.true;
            expect(evaluate({ type: 'room_visited', roomId: 'room_1' })).to.be.false;
            expect(evaluate({ type: 'room_visited', roomId: 'nowhere' })).to.be.false;
        });
    });

    describe('npc_mood', () => {
        it('should be true when the npc holds the mood and false otherwise', () => {
            const condition: Condition = { type: 'npc_mood', npcId: 'npc_1', mood: 'hostile' };

            expect(evaluate(condition, (s) => void (s.npcs.npc_1.mood = 'hostile'))).to.be.true;
            expect(evaluate(condition)).to.be.false;
        });

        it('should be false for an unknown npc', () => {
            expect(evaluate({ type: 'npc_mood', npcId: 'nobody', mood: 'neutral' })).to.be.false;
        });
    });

    describe('npc_alive', () => {
        it('should be true when health is above zero and false at zero', () => {
            expect(evaluate({ type: 'npc_alive', npcId: 'npc_1' })).to.be.true;
            expect(evaluate({ type: 'npc_alive', npcId: 'npc_1' }, (s) => void (s.npcs.npc_1.health = 0))).to.be.false;
        });

        it('should be false for an unknown npc', () => {
            expect(evaluate({ type: 'npc_alive', npcId: 'nobody' })).to.be.false;
        });
    });

    describe('logical combinators', () => {
        it('should treat and as all-true, empty-and as vacuously true', () => {
            expect(evaluate({ type: 'and', conditions: [{ type: 'true' }, { type: 'true' }] })).to.be.true;
            expect(evaluate({ type: 'and', conditions: [{ type: 'true' }, { type: 'false' }] })).to.be.false;
            expect(evaluate({ type: 'and', conditions: [] })).to.be.true;
        });

        it('should treat or as any-true, empty-or as vacuously false', () => {
            expect(evaluate({ type: 'or', conditions: [{ type: 'false' }, { type: 'true' }] })).to.be.true;
            expect(evaluate({ type: 'or', conditions: [{ type: 'false' }, { type: 'false' }] })).to.be.false;
            expect(evaluate({ type: 'or', conditions: [] })).to.be.false;
        });

        it('should negate with not', () => {
            expect(evaluate({ type: 'not', condition: { type: 'false' } })).to.be.true;
            expect(evaluate({ type: 'not', condition: { type: 'true' } })).to.be.false;
        });
    });

    describe('the chapel gate (nested and)', () => {
        const chapelGate: Condition = {
            type: 'and',
            conditions: [
                { type: 'lacks_item', itemId: 'cursed_amulet', location: 'player' },
                { type: 'flag_eq', key: 'talked_to_hermit', value: true },
            ],
        };

        it('should be barred while carrying the amulet or before talking, and open once both hold', () => {
            const carryingAndUntalked: ModifyState = (s) => void (s.player.inventory.cursed_amulet = 1);
            const talkedButCarrying: ModifyState = (s) => {
                s.player.inventory.cursed_amulet = 1;
                s.flags.talked_to_hermit = true;
            };
            const talkedAndUnburdened: ModifyState = (s) => void (s.flags.talked_to_hermit = true);

            expect(evaluate(chapelGate, carryingAndUntalked)).to.be.false;
            expect(evaluate(chapelGate, talkedButCarrying)).to.be.false;
            expect(evaluate(chapelGate, talkedAndUnburdened)).to.be.true;
        });
    });
});
