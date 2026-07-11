import { describe, it } from 'mocha';
import { expect } from 'chai';
import { z } from 'zod';

import { DefaultActionDispatcher } from './DefaultActionDispatcher';
import { ActionResolver } from './ActionResolver';
import { Action, ActionOutcome, defineActionOutcome } from '../../engine/action';
import { GameSession } from '../../engine/session';
import { Factories } from '../../engine/context';
import { createGameState } from '../../engine/state/GameState.test.utils';
import { DefaultRoomFactory, DefaultItemFactory, DefaultNpcFactory } from '../../engine/entity';
import { ZodSchema } from '../../utils/schema';

describe(DefaultActionDispatcher.name, () => {
    const factories: Factories = {
        room: new DefaultRoomFactory(),
        item: new DefaultItemFactory(),
        npc: new DefaultNpcFactory(),
    };

    const StubInputSchema = z.object({ value: z.string() });
    const StubSuccessSchema = z.object({ value: z.string() });
    const StubFailReasonSchema = z.enum(['nope']);
    const StubOutcomeSchema = defineActionOutcome(StubSuccessSchema, StubFailReasonSchema);

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

    function createResolver(actions: Record<string, Action<any, any>>): ActionResolver {
        return { resolve: (name) => actions[name] };
    }

    describe('dispatch', () => {
        it('should play the matching action and return a success ActionResult', () => {
            const session = new GameSession(createGameState(), factories);
            const action = createStubAction((ctx, input) => {
                ctx.player().moveTo(ctx.room('room_2')!);
                return ActionOutcome.succeed({ value: input.value });
            });
            const dispatcher = new DefaultActionDispatcher(createResolver({ stub: action }));

            const result = dispatcher.dispatch(session, { name: 'stub', args: { value: 'ok' } });

            expect(result).to.deep.equal({
                content: JSON.stringify({ result: 'success', data: { value: 'ok' } }),
            });
            expect(session.getState().player.currentRoomId).to.equal('room_2');
        });

        it('should return a failure ActionResult and discard state when the action fails', () => {
            const session = new GameSession(createGameState(), factories);
            const action = createStubAction((ctx) => {
                ctx.player().moveTo(ctx.room('room_2')!);
                return ActionOutcome.fail('nope');
            });
            const dispatcher = new DefaultActionDispatcher(createResolver({ stub: action }));

            const result = dispatcher.dispatch(session, { name: 'stub', args: { value: 'ok' } });

            expect(result).to.deep.equal({
                content: JSON.stringify({ result: 'failure', reason: 'nope', message: undefined }),
            });
            expect(session.getState().player.currentRoomId).to.equal('room_1');
        });

        it('should return an unknown_action failure when no action matches the invocation name', () => {
            const session = new GameSession(createGameState(), factories);
            const dispatcher = new DefaultActionDispatcher(createResolver({}));

            const result = dispatcher.dispatch(session, { name: 'nonexistent', args: {} });

            expect(result).to.deep.equal({
                content: JSON.stringify({ result: 'failure', reason: 'unknown_action', message: undefined }),
            });
        });

        it('should return an invalid_input failure when the args fail to parse', () => {
            const session = new GameSession(createGameState(), factories);
            const action = createStubAction(() => {
                throw new Error('should not be called when input is invalid');
            });
            const dispatcher = new DefaultActionDispatcher(createResolver({ stub: action }));

            const result = dispatcher.dispatch(session, { name: 'stub', args: { value: 42 } });

            expect(result).to.deep.equal({
                content: JSON.stringify({ result: 'failure', reason: 'invalid_input', message: undefined }),
            });
        });

        it('should return an internal_error failure carrying the thrown error message when the action throws unexpectedly', () => {
            const session = new GameSession(createGameState(), factories);
            const action = createStubAction(() => {
                throw new Error('bug');
            });
            const dispatcher = new DefaultActionDispatcher(createResolver({ stub: action }));

            const result = dispatcher.dispatch(session, { name: 'stub', args: { value: 'ok' } });

            expect(result).to.deep.equal({
                content: JSON.stringify({ result: 'failure', reason: 'internal_error', message: 'bug' }),
            });
        });

        it('should leave the session usable for a subsequent dispatch after an error', () => {
            const session = new GameSession(createGameState(), factories);
            const throwingAction = createStubAction(() => {
                throw new Error('bug');
            });
            const movingAction = createStubAction((ctx) => {
                ctx.player().moveTo(ctx.room('room_2')!);
                return ActionOutcome.succeed({ value: 'ok' });
            });
            const dispatcher = new DefaultActionDispatcher(
                createResolver({ throwing: throwingAction, moving: movingAction }),
            );

            dispatcher.dispatch(session, { name: 'throwing', args: { value: 'ok' } });
            const result = dispatcher.dispatch(session, { name: 'moving', args: { value: 'ok' } });

            expect(result.content).to.equal(JSON.stringify({ result: 'success', data: { value: 'ok' } }));
            expect(session.getState().player.currentRoomId).to.equal('room_2');
        });
    });
});
