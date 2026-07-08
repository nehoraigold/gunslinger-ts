import { describe, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';

import { MoveAction } from './MoveAction';
import { Context, GameContext } from '../../context';
import { fakeContext, fakeRoom } from '../../context/Context.test.utils';
import { GameTransaction } from '../../transaction';
import { createGameState, ModifyState } from '../../state/GameState.test.utils';
import { DefaultRoomFactory, DefaultItemFactory, DefaultNpcFactory } from '../../entity';
import { ExitState, GameState } from '../../state';
import { MovementOutcome } from '../../service/movement/MovementOutcome';

describe(MoveAction.name, () => {
    describe('execute', () => {
        describe('wired to the real MovementService', () => {
            function createDefaultContext(modifyState?: ModifyState): Context {
                const state = createGameState(modifyState);
                return new GameContext(new GameTransaction(state), {
                    room: new DefaultRoomFactory(),
                    item: new DefaultItemFactory(),
                    npc: new DefaultNpcFactory(),
                });
            }

            function setExitsInCurrentRoom(...exits: ExitState[]): (state: GameState) => void {
                return (state) => (state.rooms[state.player.currentRoomId].exits = exits ?? []);
            }

            it('should move the player and return a success outcome with the destination room id', () => {
                const ctx = createDefaultContext(
                    setExitsInCurrentRoom({ direction: 'west', destinationRoomId: 'room_2' }),
                );
                const action = new MoveAction();

                const outcome = action.execute(ctx, { direction: 'west' });

                expect(outcome).to.deep.equal({ result: 'success', data: { roomId: 'room_2' } });
                expect(ctx.player().currentRoomId).to.equal('room_2');
            });
        });

        describe('with a fake MovementService', () => {
            function createActionWithFakeMovement(outcome: MovementOutcome) {
                return new MoveAction(() => ({ move: sinon.stub().returns(outcome) }));
            }

            it('should translate a "moved" outcome into a success outcome', () => {
                const action = createActionWithFakeMovement({ type: 'moved', room: fakeRoom({ id: 'room_9' }) });

                const outcome = action.execute(fakeContext(), { direction: 'west' });

                expect(outcome).to.deep.equal({ result: 'success', data: { roomId: 'room_9' } });
            });

            it('should translate a "noSuchExit" outcome into a "no_exit" failure', () => {
                const action = createActionWithFakeMovement({ type: 'noSuchExit' });

                const outcome = action.execute(fakeContext(), { direction: 'west' });

                expect(outcome).to.deep.include({ result: 'failure', reason: 'no_exit' });
            });

            it('should translate an "exitBlocked" outcome into an "exit_blocked" failure', () => {
                const action = createActionWithFakeMovement({ type: 'exitBlocked' });

                const outcome = action.execute(fakeContext(), { direction: 'west' });

                expect(outcome).to.deep.include({ result: 'failure', reason: 'exit_blocked' });
            });

            it('should translate an "entryBarred" outcome into an "entry_barred" failure', () => {
                const action = createActionWithFakeMovement({ type: 'entryBarred' });

                const outcome = action.execute(fakeContext(), { direction: 'west' });

                expect(outcome).to.deep.include({ result: 'failure', reason: 'entry_barred' });
            });
        });
    });

    describe('schema', () => {
        it('should accept a valid direction', () => {
            expect(() => new MoveAction().schema.parse({ direction: 'north' })).to.not.throw();
        });

        it('should reject an invalid direction', () => {
            expect(() => new MoveAction().schema.parse({ direction: 'sideways' })).to.throw();
        });
    });
});
