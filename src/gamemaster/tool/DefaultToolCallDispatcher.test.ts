import { describe, it } from 'mocha';
import { expect } from 'chai';
import { z } from 'zod';

import { DefaultToolCallDispatcher } from './DefaultToolCallDispatcher';
import { ToolCatalog, ToolCatalogEntry } from './ToolCatalog';
import { Action, Verdict, defineActionOutcome } from '../../engine/action';
import { GameSession } from '../../engine/session';
import { Factories } from '../../engine/context';
import { createGameState } from '../../engine/state/GameState.test.utils';
import { DefaultRoomFactory, DefaultItemFactory } from '../../engine/entity';
import { ZodSchema } from '../../utils/schema';

describe(DefaultToolCallDispatcher.name, () => {
    const factories: Factories = { room: new DefaultRoomFactory(), item: new DefaultItemFactory() };

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

    function createCatalog(entries: Record<string, ToolCatalogEntry>): ToolCatalog {
        return {
            listDefinitions: () => [],
            find: (name) => entries[name],
        };
    }

    describe('dispatch', () => {
        it('should play the matching action and return a success ToolResult', () => {
            const session = new GameSession(createGameState(), factories);
            const action = createStubAction((ctx, input) => {
                ctx.player().moveTo(ctx.room('room_2')!);
                return Verdict.succeed({ value: input.value });
            });
            const dispatcher = new DefaultToolCallDispatcher(createCatalog({ stub: { action, description: 'Stub.' } }));

            const result = dispatcher.dispatch(session, { id: 'call_1', name: 'stub', args: { value: 'ok' } });

            expect(result).to.deep.equal({
                callId: 'call_1',
                name: 'stub',
                content: JSON.stringify({ result: 'success', data: { value: 'ok' } }),
            });
            expect(session.getState().player.currentRoomId).to.equal('room_2');
        });

        it('should return a failure ToolResult and discard state when the action fails', () => {
            const session = new GameSession(createGameState(), factories);
            const action = createStubAction((ctx) => {
                ctx.player().moveTo(ctx.room('room_2')!);
                return Verdict.fail('nope');
            });
            const dispatcher = new DefaultToolCallDispatcher(createCatalog({ stub: { action, description: 'Stub.' } }));

            const result = dispatcher.dispatch(session, { id: 'call_1', name: 'stub', args: { value: 'ok' } });

            expect(result).to.deep.equal({
                callId: 'call_1',
                name: 'stub',
                content: JSON.stringify({ result: 'failure', reason: 'nope', message: undefined }),
            });
            expect(session.getState().player.currentRoomId).to.equal('room_1');
        });

        it('should return an unknown_tool failure when no entry matches the call name', () => {
            const session = new GameSession(createGameState(), factories);
            const dispatcher = new DefaultToolCallDispatcher(createCatalog({}));

            const result = dispatcher.dispatch(session, { id: 'call_1', name: 'nonexistent', args: {} });

            expect(result).to.deep.equal({
                callId: 'call_1',
                name: 'nonexistent',
                content: JSON.stringify({ result: 'failure', reason: 'unknown_tool', message: undefined }),
            });
        });

        it('should return an invalid_input failure when the args fail to parse', () => {
            const session = new GameSession(createGameState(), factories);
            const action = createStubAction(() => {
                throw new Error('should not be called when input is invalid');
            });
            const dispatcher = new DefaultToolCallDispatcher(createCatalog({ stub: { action, description: 'Stub.' } }));

            const result = dispatcher.dispatch(session, { id: 'call_1', name: 'stub', args: { value: 42 } });

            expect(result).to.deep.equal({
                callId: 'call_1',
                name: 'stub',
                content: JSON.stringify({ result: 'failure', reason: 'invalid_input', message: undefined }),
            });
        });

        it('should return an internal_error failure when the action throws unexpectedly', () => {
            const session = new GameSession(createGameState(), factories);
            const action = createStubAction(() => {
                throw new Error('bug');
            });
            const dispatcher = new DefaultToolCallDispatcher(createCatalog({ stub: { action, description: 'Stub.' } }));

            const result = dispatcher.dispatch(session, { id: 'call_1', name: 'stub', args: { value: 'ok' } });

            expect(result).to.deep.equal({
                callId: 'call_1',
                name: 'stub',
                content: JSON.stringify({ result: 'failure', reason: 'internal_error', message: undefined }),
            });
        });

        it('should leave the session usable for a subsequent dispatch after an error', () => {
            const session = new GameSession(createGameState(), factories);
            const throwingAction = createStubAction(() => {
                throw new Error('bug');
            });
            const movingAction = createStubAction((ctx) => {
                ctx.player().moveTo(ctx.room('room_2')!);
                return Verdict.succeed({ value: 'ok' });
            });
            const dispatcher = new DefaultToolCallDispatcher(
                createCatalog({
                    throwing: { action: throwingAction, description: 'Throws.' },
                    moving: { action: movingAction, description: 'Moves.' },
                }),
            );

            dispatcher.dispatch(session, { id: 'call_1', name: 'throwing', args: { value: 'ok' } });
            const result = dispatcher.dispatch(session, { id: 'call_2', name: 'moving', args: { value: 'ok' } });

            expect(result.content).to.equal(JSON.stringify({ result: 'success', data: { value: 'ok' } }));
            expect(session.getState().player.currentRoomId).to.equal('room_2');
        });
    });
});
