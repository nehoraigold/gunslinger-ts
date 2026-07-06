import { describe, it } from 'mocha';
import { expect } from 'chai';
import { z } from 'zod';

import { GameSession } from './GameSession';
import { TurnSystem } from './TurnSystem';
import { Action, Verdict, defineActionOutcome } from '../action';
import { Context, Factories } from '../context';
import { createGameState } from '../state/GameState.test.utils';
import { DefaultRoomFactory, DefaultItemFactory, DefaultNpcFactory } from '../entity';
import { ZodSchema, ParseError } from '../../utils/schema';

describe(GameSession.name, () => {
    const factories: Factories = {
        room: new DefaultRoomFactory(),
        item: new DefaultItemFactory(),
        npc: new DefaultNpcFactory(),
    };

    const StubInputSchema = z.object({ value: z.string() });
    const StubSuccessDataSchema = z.object({ value: z.string() });
    const StubFailReasonSchema = z.enum(['nope']);
    const StubOutcomeSchema = defineActionOutcome(StubSuccessDataSchema, StubFailReasonSchema);

    type StubInput = z.infer<typeof StubInputSchema>;
    type StubOutcome = z.infer<typeof StubOutcomeSchema>;

    function createStubAction(execute: Action<StubInput, StubOutcome>['execute']): Action<StubInput, StubOutcome> {
        return {
            name: 'stub',
            schema: new ZodSchema(StubInputSchema),
            outcomeSchema: StubOutcomeSchema,
            execute,
        };
    }

    describe('playTurn', () => {
        it('should commit state changes made by the action when it succeeds', () => {
            const session = new GameSession(createGameState(), factories);
            const action = createStubAction((ctx, input) => {
                ctx.player().moveTo(ctx.room('room_2')!);
                return Verdict.succeed({ value: input.value });
            });

            const outcome = session.playTurn(action, { value: 'ok' });

            expect(outcome).to.deep.equal({ result: 'success', data: { value: 'ok' } });
            expect(session.getState().player.currentRoomId).to.equal('room_2');
        });

        it('should discard state changes made by the action when it fails', () => {
            const session = new GameSession(createGameState(), factories);
            const action = createStubAction((ctx) => {
                ctx.player().moveTo(ctx.room('room_2')!);
                return Verdict.fail('nope');
            });

            const outcome = session.playTurn(action, { value: 'ok' });

            expect(outcome).to.deep.equal({ result: 'failure', reason: 'nope', message: undefined });
            expect(session.getState().player.currentRoomId).to.equal('room_1');
        });

        it('should validate the raw input against the action schema before executing', () => {
            const session = new GameSession(createGameState(), factories);
            const action = createStubAction(() => {
                throw new Error('should not be called when input is invalid');
            });

            expect(() => session.playTurn(action, { value: 42 })).to.throw(ParseError);
        });

        it('should not begin a transaction when the raw input fails to parse', () => {
            const session = new GameSession(createGameState(), factories);
            const invalidAction = createStubAction(() => {
                throw new Error('should not be called when input is invalid');
            });
            const validAction = createStubAction((ctx) => {
                ctx.player().moveTo(ctx.room('room_2')!);
                return Verdict.succeed({ value: 'ok' });
            });

            expect(() => session.playTurn(invalidAction, { value: 42 })).to.throw(ParseError);
            const outcome = session.playTurn(validAction, { value: 'ok' });

            expect(outcome).to.deep.equal({ result: 'success', data: { value: 'ok' } });
            expect(session.getState().player.currentRoomId).to.equal('room_2');
        });

        it('should start each new turn from the state committed by the previous turn', () => {
            const session = new GameSession(createGameState(), factories);
            const moveToRoom2 = createStubAction((ctx) => {
                ctx.player().moveTo(ctx.room('room_2')!);
                return Verdict.succeed({ value: 'ok' });
            });
            const moveToRoom1 = createStubAction((ctx) => {
                ctx.player().moveTo(ctx.room('room_1')!);
                return Verdict.succeed({ value: 'ok' });
            });

            session.playTurn(moveToRoom2, { value: 'ok' });
            session.playTurn(moveToRoom1, { value: 'ok' });

            expect(session.getState().player.currentRoomId).to.equal('room_1');
        });

        it('should allow a subsequent turn to be played after an action throws', () => {
            const session = new GameSession(createGameState(), factories);
            const throwingAction = createStubAction(() => {
                throw new Error('boom');
            });
            const moveToRoom2 = createStubAction((ctx) => {
                ctx.player().moveTo(ctx.room('room_2')!);
                return Verdict.succeed({ value: 'ok' });
            });

            expect(() => session.playTurn(throwingAction, { value: 'ok' })).to.throw('boom');
            const outcome = session.playTurn(moveToRoom2, { value: 'ok' });

            expect(outcome).to.deep.equal({ result: 'success', data: { value: 'ok' } });
            expect(session.getState().player.currentRoomId).to.equal('room_2');
        });
    });

    describe('turn clock', () => {
        const succeed = createStubAction(() => Verdict.succeed({ value: 'ok' }));
        const fail = createStubAction(() => Verdict.fail('nope'));

        it('should advance the turn by one when an action succeeds', () => {
            const session = new GameSession(createGameState(), factories);

            session.playTurn(succeed, { value: 'ok' });

            expect(session.getState().clock.turn).to.equal(1);
        });

        it('should advance once per successful turn across multiple turns', () => {
            const session = new GameSession(createGameState(), factories);

            session.playTurn(succeed, { value: 'ok' });
            session.playTurn(succeed, { value: 'ok' });
            session.playTurn(succeed, { value: 'ok' });

            expect(session.getState().clock.turn).to.equal(3);
        });

        it('should not advance the turn when an action fails', () => {
            const session = new GameSession(createGameState(), factories);

            session.playTurn(fail, { value: 'ok' });

            expect(session.getState().clock.turn).to.equal(0);
        });

        it('should not advance the turn when the raw input fails to parse', () => {
            const session = new GameSession(createGameState(), factories);

            expect(() => session.playTurn(succeed, { value: 42 })).to.throw(ParseError);
            expect(session.getState().clock.turn).to.equal(0);
        });

        it('should not advance the turn when an action throws', () => {
            const session = new GameSession(createGameState(), factories);
            const throwing = createStubAction(() => {
                throw new Error('boom');
            });

            expect(() => session.playTurn(throwing, { value: 'ok' })).to.throw('boom');
            expect(session.getState().clock.turn).to.equal(0);
        });
    });

    describe('post-turn systems', () => {
        const succeed = createStubAction(() => Verdict.succeed({ value: 'ok' }));
        const fail = createStubAction(() => Verdict.fail('nope'));

        const recordingSystem = (log: number[]): TurnSystem => ({
            run: (ctx: Context) => log.push(ctx.clock().currentTurn()),
        });

        it('should run registered systems after a successful action, observing the advanced turn', () => {
            const seen: number[] = [];
            const session = new GameSession(createGameState(), factories, [recordingSystem(seen)]);

            session.playTurn(succeed, { value: 'ok' });

            expect(seen).to.deep.equal([1]);
        });

        it('should run registered systems in order', () => {
            const order: string[] = [];
            const first: TurnSystem = { run: () => order.push('first') };
            const second: TurnSystem = { run: () => order.push('second') };
            const session = new GameSession(createGameState(), factories, [first, second]);

            session.playTurn(succeed, { value: 'ok' });

            expect(order).to.deep.equal(['first', 'second']);
        });

        it('should not run systems when the action fails', () => {
            const seen: number[] = [];
            const session = new GameSession(createGameState(), factories, [recordingSystem(seen)]);

            session.playTurn(fail, { value: 'ok' });

            expect(seen).to.deep.equal([]);
        });

        it('should roll back the whole turn, including the tick, when a system throws', () => {
            const explodingSystem: TurnSystem = {
                run: () => {
                    throw new Error('system boom');
                },
            };
            const moveAndSucceed = createStubAction((ctx) => {
                ctx.player().moveTo(ctx.room('room_2')!);
                return Verdict.succeed({ value: 'ok' });
            });
            const session = new GameSession(createGameState(), factories, [explodingSystem]);

            expect(() => session.playTurn(moveAndSucceed, { value: 'ok' })).to.throw('system boom');
            expect(session.getState().clock.turn).to.equal(0);
            expect(session.getState().player.currentRoomId).to.equal('room_1');
        });
    });
});
