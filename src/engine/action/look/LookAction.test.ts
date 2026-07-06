import { describe, it } from 'mocha';
import { expect } from 'chai';

import { LookAction } from './LookAction';
import { Context, GameContext } from '../../context';
import { GameTransaction } from '../../transaction';
import { createGameState, ModifyState } from '../../state/GameState.test.utils';
import { DefaultRoomFactory, DefaultItemFactory, DefaultNpcFactory } from '../../entity';
import { GameState } from '../../state';
import { ItemNotFoundError } from '../../error';

describe(LookAction.name, () => {
    function createDefaultContext(modifyState?: ModifyState): Context {
        const state = createGameState(modifyState);
        return new GameContext(new GameTransaction(state), {
            room: new DefaultRoomFactory(),
            item: new DefaultItemFactory(),
            npc: new DefaultNpcFactory(),
        });
    }

    function withRoomItem(itemId: string, quantity: number): (state: GameState) => void {
        return (state) => {
            state.rooms.room_1.inventory[itemId] = quantity;
        };
    }

    function withNpcInRoom(npcId: string): (state: GameState) => void {
        return (state) => {
            state.rooms.room_1.npcIds.push(npcId);
        };
    }

    function withLockedWestExit(state: GameState): void {
        state.rooms.room_1.exits[0].lock = { keyItemId: 'item_1', isLocked: true, consumesKey: false };
    }

    describe('execute', () => {
        it('should describe the current room, its light level, exits, and items', () => {
            const ctx = createDefaultContext((state) => {
                state.rooms.room_1.lightLevel = 'dim';
                withRoomItem('item_1', 2)(state);
            });

            const outcome = new LookAction().execute(ctx);

            expect(outcome).to.deep.equal({
                result: 'success',
                data: {
                    room: { name: 'Room 1', description: 'The first room', lightLevel: 'dim' },
                    firstVisit: true,
                    exits: [{ direction: 'west', isBlocked: false }],
                    items: [{ itemId: 'item_1', name: 'Item 1', quantity: 2 }],
                    npcs: [],
                },
            });
        });

        it('should list the npcs present in the room', () => {
            const ctx = createDefaultContext((state) => {
                withNpcInRoom('npc_1')(state);
                withNpcInRoom('npc_2')(state);
            });

            const outcome = new LookAction().execute(ctx);

            expect(outcome.result === 'success' && outcome.data.npcs).to.deep.equal([
                { npcId: 'npc_1', name: 'Npc 1' },
                { npcId: 'npc_2', name: 'Npc 2' },
            ]);
        });

        it('should report a locked exit as blocked with a reason', () => {
            const ctx = createDefaultContext(withLockedWestExit);

            const outcome = new LookAction().execute(ctx);

            expect(outcome).to.deep.equal({
                result: 'success',
                data: {
                    room: { name: 'Room 1', description: 'The first room', lightLevel: 'bright' },
                    firstVisit: true,
                    exits: [{ direction: 'west', isBlocked: true, blockReason: 'door_locked' }],
                    items: [],
                    npcs: [],
                },
            });
        });

        it('should throw an ItemNotFoundError when a room item has no definition', () => {
            const ctx = createDefaultContext(withRoomItem('nonexistent_item', 1));

            const look = () => new LookAction().execute(ctx);

            expect(look).to.throw(ItemNotFoundError, /nonexistent_item/);
        });

        it('should report firstVisit true only the first time the room is observed', () => {
            const ctx = createDefaultContext();
            const action = new LookAction();

            const first = action.execute(ctx);
            const second = action.execute(ctx);

            expect(first.result === 'success' && first.data.firstVisit).to.be.true;
            expect(second.result === 'success' && second.data.firstVisit).to.be.false;
        });
    });

    describe('schema', () => {
        it('should accept no input', () => {
            expect(() => new LookAction().schema.parse(undefined)).to.not.throw();
        });
    });
});
