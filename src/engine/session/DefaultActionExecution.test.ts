import { describe, it } from 'mocha';
import { expect } from 'chai';
import { z } from 'zod';

import { DefaultActionExecution } from './DefaultActionExecution';
import { Action, Verdict, defineActionOutcome } from '../action';
import { Factories, GameContext } from '../context';
import { GameTransaction } from '../transaction';
import { createGameState } from '../state/GameState.test.utils';
import { DefaultRoomFactory, DefaultItemFactory, DefaultNpcFactory } from '../entity';
import { ZodSchema } from '../../utils/schema';

describe(DefaultActionExecution.name, () => {
    const factories: Factories = {
        room: new DefaultRoomFactory(),
        item: new DefaultItemFactory(),
        npc: new DefaultNpcFactory(),
    };

    const createContext = () => new GameContext(new GameTransaction(createGameState()), factories);

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
        it('should execute the action against the given context and return its outcome', () => {
            const execution = new DefaultActionExecution();
            const context = createContext();
            const action = createStubAction((ctx, input) => {
                ctx.player().moveTo(ctx.room('room_2')!);
                return Verdict.succeed({ value: input.value });
            });

            const outcome = execution.play(context, action, { value: 'ok' });

            expect(outcome).to.deep.equal({ result: 'success', data: { value: 'ok' } });
            expect(context.player().currentRoomId).to.equal('room_2');
        });

        it('should throw when play is called more than once', () => {
            const execution = new DefaultActionExecution();
            const action = createStubAction(() => Verdict.succeed({ value: 'ok' }));

            execution.play(createContext(), action, { value: 'ok' });

            expect(() => execution.play(createContext(), action, { value: 'ok' })).to.throw(/one action/i);
        });
    });
});
