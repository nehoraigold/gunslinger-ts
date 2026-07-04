import { describe, it } from 'mocha';
import { expect } from 'chai';
import { z } from 'zod';

import { GameSession } from './GameSession';
import { Action, Verdict, defineActionOutcome } from '../action';
import { Factories } from '../context';
import { createGameState } from '../state/GameState.test.utils';
import { DefaultRoomFactory, DefaultItemFactory } from '../entity';
import { ZodParser, ParseError } from '../../utils/parser';

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
            inputSchema: StubInputSchema,
            outcomeSchema: StubOutcomeSchema,
            inputParser: new ZodParser(StubInputSchema),
            execute,
        };
    }

    describe('perform', () => {
        it('should commit state changes made by the action when it succeeds', () => {
            const session = new GameSession(createGameState(), factories);
            const action = createStubAction((ctx, input) => {
                ctx.player().moveTo(ctx.room('room_2')!);
                return Verdict.succeed({ value: input.value });
            });

            const outcome = session.perform(action, { value: 'ok' });

            expect(outcome).to.deep.equal({ result: 'success', data: { value: 'ok' } });
            expect(session.getState().player.currentRoomId).to.equal('room_2');
        });

        it('should discard state changes made by the action when it fails', () => {
            const session = new GameSession(createGameState(), factories);
            const action = createStubAction((ctx) => {
                ctx.player().moveTo(ctx.room('room_2')!);
                return Verdict.fail('nope');
            });

            const outcome = session.perform(action, { value: 'ok' });

            expect(outcome).to.deep.equal({ result: 'failure', reason: 'nope', message: undefined });
            expect(session.getState().player.currentRoomId).to.equal('room_1');
        });

        it('should validate the raw input against the action schema before executing', () => {
            const session = new GameSession(createGameState(), factories);
            const action = createStubAction(() => {
                throw new Error('should not be called when input is invalid');
            });

            expect(() => session.perform(action, { value: 42 })).to.throw(ParseError);
        });
    });
});
