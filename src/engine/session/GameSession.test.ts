import { describe, it } from 'mocha';
import { expect } from 'chai';
import { z } from 'zod';

import { GameSession } from './GameSession';
import { Action, Verdict, defineActionOutcome } from '../action';
import { Factories } from '../context';
import { createGameState } from '../state/GameState.test.utils';
import { DefaultRoomFactory, DefaultItemFactory } from '../entity';
import { ZodSchema, ParseError } from '../../utils/schema';

describe(GameSession.name, () => {
    const factories: Factories = { room: new DefaultRoomFactory(), item: new DefaultItemFactory() };

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
});
