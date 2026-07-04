import { describe, it } from 'mocha';
import { expect } from 'chai';
import { z } from 'zod';

import { DefaultGameTurn } from './DefaultGameTurn';
import { Action, Verdict, defineActionOutcome } from '../action';
import { Factories } from '../context';
import { GameTransaction } from '../transaction';
import { createGameState } from '../state/GameState.test.utils';
import { DefaultRoomFactory, DefaultItemFactory } from '../entity';
import { ZodParser } from '../../utils/parser';

describe(DefaultGameTurn.name, () => {
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

    describe('play', () => {
        it('should throw when play is called more than once', () => {
            const tx = new GameTransaction(createGameState());
            const turn = new DefaultGameTurn(tx, factories);
            const action = createStubAction(() => Verdict.succeed({ value: 'ok' }));

            turn.play(action, { value: 'ok' });

            expect(() => turn.play(action, { value: 'ok' })).to.throw(/one action/i);
        });
    });

    describe('wasSuccessful', () => {
        it('should return true when the action succeeded', () => {
            const tx = new GameTransaction(createGameState());
            const turn = new DefaultGameTurn(tx, factories);
            const action = createStubAction((ctx, input) => {
                ctx.player().moveTo(ctx.room('room_2')!);
                return Verdict.succeed({ value: input.value });
            });
            turn.play(action, { value: 'ok' });

            expect(turn.wasSuccessful()).to.equal(true);
        });

        it('should return false when the action failed', () => {
            const tx = new GameTransaction(createGameState());
            const turn = new DefaultGameTurn(tx, factories);
            const action = createStubAction(() => Verdict.fail('nope'));
            turn.play(action, { value: 'ok' });

            expect(turn.wasSuccessful()).to.equal(false);
        });

        it('should return false when no action was ever played', () => {
            const tx = new GameTransaction(createGameState());
            const turn = new DefaultGameTurn(tx, factories);

            expect(turn.wasSuccessful()).to.equal(false);
        });
    });
});
