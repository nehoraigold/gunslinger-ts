import { describe, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';

import { UnlockAction } from './UnlockAction';
import { Context, GameContext } from '../../context';
import { GameTransaction } from '../../transaction';
import { createGameState, ModifyState } from '../../state/GameState.test.utils';
import { DefaultRoomFactory, DefaultItemFactory, Exit, Inventory, Lock, Player, Room } from '../../entity';
import { GameState } from '../../state';
import { UnlockOutcome } from '../../service/lock/UnlockOutcome';

describe(UnlockAction.name, () => {
    function createFakeLock(): Lock {
        return { keyItemId: 'iron_key', isLocked: () => true, consumesKey: () => false, open: () => {} };
    }

    function createFakeExit(lock: Lock | undefined): Exit {
        return { destinationRoomId: 'room_2', isBlocked: () => false, blockReason: () => undefined, lock: () => lock };
    }

    function createFakeContext(exit: Exit | undefined): Context {
        const fakeInventory: Inventory = {
            quantityOf: () => 0,
            has: () => false,
            add: () => {},
            remove: () => {},
            list: () => [],
        };
        const fakePlayer: Player = { currentRoomId: 'room_1', moveTo: () => {}, inventory: () => fakeInventory };
        const fakeRoom: Room = { id: 'room_1', getExit: () => exit, inventory: () => fakeInventory };
        const unused = () => {
            throw new Error('Context member should not be used in this test');
        };
        return { player: () => fakePlayer, room: unused, item: unused, requireCurrentRoom: () => fakeRoom };
    }

    describe('execute', () => {
        describe('wired to the real LockService', () => {
            function createDefaultContext(modifyState?: ModifyState): Context {
                const state = createGameState(modifyState);
                return new GameContext(new GameTransaction(state), {
                    room: new DefaultRoomFactory(),
                    item: new DefaultItemFactory(),
                });
            }

            function withLockedWestExit(consumesKey: boolean): (state: GameState) => void {
                return (state) => {
                    state.rooms.room_1.exits = [
                        {
                            direction: 'west',
                            destinationRoomId: 'room_2',
                            lock: { keyItemId: 'iron_key', isLocked: true, consumesKey },
                        },
                    ];
                    state.player.inventory = { iron_key: 1 };
                };
            }

            it('should unlock the exit and return a success outcome with the direction and key', () => {
                const ctx = createDefaultContext(withLockedWestExit(false));
                const action = new UnlockAction();

                const outcome = action.execute(ctx, { direction: 'west' });

                expect(outcome).to.deep.equal({
                    result: 'success',
                    data: { direction: 'west', keyItemId: 'iron_key' },
                });
                expect(ctx.room('room_1')!.getExit('west')!.isBlocked()).to.be.false;
            });

            it('should keep the key when the lock does not consume it', () => {
                const ctx = createDefaultContext(withLockedWestExit(false));

                new UnlockAction().execute(ctx, { direction: 'west' });

                expect(ctx.player().inventory().quantityOf('iron_key')).to.equal(1);
            });

            it('should consume the key when the lock consumes it', () => {
                const ctx = createDefaultContext(withLockedWestExit(true));

                new UnlockAction().execute(ctx, { direction: 'west' });

                expect(ctx.player().inventory().quantityOf('iron_key')).to.equal(0);
            });

            it('should return a missing_key failure and leave the exit locked when the player lacks the key', () => {
                const ctx = createDefaultContext((state) => {
                    state.rooms.room_1.exits = [
                        {
                            direction: 'west',
                            destinationRoomId: 'room_2',
                            lock: { keyItemId: 'iron_key', isLocked: true, consumesKey: false },
                        },
                    ];
                });
                const action = new UnlockAction();

                const outcome = action.execute(ctx, { direction: 'west' });

                expect(outcome).to.deep.equal({ result: 'failure', reason: 'missing_key', message: undefined });
                expect(ctx.room('room_1')!.getExit('west')!.isBlocked()).to.be.true;
            });
        });

        describe('with a fake LockService', () => {
            function createActionWithFakeLockService(outcome: UnlockOutcome) {
                return new UnlockAction({ unlock: sinon.stub().returns(outcome) });
            }

            it('should return a no_exit failure when the room has no exit in that direction', () => {
                const action = createActionWithFakeLockService({ type: 'unlocked' });

                const outcome = action.execute(createFakeContext(undefined), { direction: 'north' });

                expect(outcome).to.deep.equal({ result: 'failure', reason: 'no_exit', message: undefined });
            });

            it('should return a not_lockable failure when the exit has no lock', () => {
                const action = createActionWithFakeLockService({ type: 'unlocked' });

                const outcome = action.execute(createFakeContext(createFakeExit(undefined)), { direction: 'north' });

                expect(outcome).to.deep.equal({ result: 'failure', reason: 'not_lockable', message: undefined });
            });

            it('should translate an "unlocked" outcome into a success outcome', () => {
                const action = createActionWithFakeLockService({ type: 'unlocked' });

                const outcome = action.execute(createFakeContext(createFakeExit(createFakeLock())), {
                    direction: 'north',
                });

                expect(outcome).to.deep.equal({
                    result: 'success',
                    data: { direction: 'north', keyItemId: 'iron_key' },
                });
            });

            it('should translate an "alreadyUnlocked" outcome into an already_unlocked failure', () => {
                const action = createActionWithFakeLockService({ type: 'alreadyUnlocked' });

                const outcome = action.execute(createFakeContext(createFakeExit(createFakeLock())), {
                    direction: 'north',
                });

                expect(outcome).to.deep.equal({ result: 'failure', reason: 'already_unlocked', message: undefined });
            });

            it('should translate a "missingKey" outcome into a missing_key failure', () => {
                const action = createActionWithFakeLockService({ type: 'missingKey' });

                const outcome = action.execute(createFakeContext(createFakeExit(createFakeLock())), {
                    direction: 'north',
                });

                expect(outcome).to.deep.equal({ result: 'failure', reason: 'missing_key', message: undefined });
            });
        });
    });

    describe('schema', () => {
        it('should accept a valid direction', () => {
            expect(() => new UnlockAction().schema.parse({ direction: 'north' })).to.not.throw();
        });

        it('should reject an invalid direction', () => {
            expect(() => new UnlockAction().schema.parse({ direction: 'sideways' })).to.throw();
        });
    });
});
