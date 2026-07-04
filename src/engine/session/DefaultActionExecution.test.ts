import { describe, it } from 'mocha';
import { expect } from 'chai';
import { z } from 'zod';

import { DefaultActionExecution } from './DefaultActionExecution';
import { Action, Verdict, defineActionOutcome } from '../action';
import { Factories } from '../context';
import { GameTransaction } from '../transaction';
import { createGameState } from '../state/GameState.test.utils';
import { DefaultRoomFactory, DefaultItemFactory } from '../entity';
import { ZodSchema } from '../../utils/schema';

describe(DefaultActionExecution.name, () => {
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

    describe('play', () => {
        it('should throw when play is called more than once', () => {
            const tx = new GameTransaction(createGameState());
            const execution = new DefaultActionExecution(tx, factories);
            const action = createStubAction(() => Verdict.succeed({ value: 'ok' }));

            execution.play(action, { value: 'ok' });

            expect(() => execution.play(action, { value: 'ok' })).to.throw(/one action/i);
        });
    });

    describe('wasSuccessful', () => {
        it('should return true when the action succeeded', () => {
            const tx = new GameTransaction(createGameState());
            const execution = new DefaultActionExecution(tx, factories);
            const action = createStubAction((ctx, input) => {
                ctx.player().moveTo(ctx.room('room_2')!);
                return Verdict.succeed({ value: input.value });
            });
            execution.play(action, { value: 'ok' });

            expect(execution.wasSuccessful()).to.equal(true);
        });

        it('should return false when the action failed', () => {
            const tx = new GameTransaction(createGameState());
            const execution = new DefaultActionExecution(tx, factories);
            const action = createStubAction(() => Verdict.fail('nope'));
            execution.play(action, { value: 'ok' });

            expect(execution.wasSuccessful()).to.equal(false);
        });

        it('should return false when no action was ever played', () => {
            const tx = new GameTransaction(createGameState());
            const execution = new DefaultActionExecution(tx, factories);

            expect(execution.wasSuccessful()).to.equal(false);
        });
    });
});
