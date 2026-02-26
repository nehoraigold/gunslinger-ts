import { z } from 'zod';
import { GameState } from '../state/GameState';
import { ActionOutcome, defineActionOutcome } from './ActionOutcome';

export type ExecuteResult<OutcomeT> = { state?: GameState; outcome: OutcomeT };
export type ExecuteFunction<InputT, OutcomeT> = (state: GameState, input: InputT) => ExecuteResult<OutcomeT>;

export type ActionContext<SuccessDataT extends z.ZodSchema, FailReasonT extends z.ZodSchema> = {
    fail: (
        reason: z.infer<FailReasonT>,
        message?: string,
    ) => ExecuteResult<z.infer<ActionOutcome<SuccessDataT, FailReasonT>>>;
    succeed: (
        data: z.infer<SuccessDataT>,
        state?: GameState,
    ) => ExecuteResult<z.infer<ActionOutcome<SuccessDataT, FailReasonT>>>;
};

type DefineExecuteFunction<InputT, SuccessDataT extends z.ZodSchema, FailReasonT extends z.ZodSchema> = (
    state: GameState,
    input: InputT,
    ctx: ActionContext<SuccessDataT, FailReasonT>,
) => ExecuteResult<z.infer<ActionOutcome<SuccessDataT, FailReasonT>>>;

export interface Action<InputT, OutcomeT> {
    name: string;
    inputSchema: InputT;
    outcomeSchema: OutcomeT;
    execute: ExecuteFunction<z.infer<InputT>, z.infer<OutcomeT>>;
}

export const defineAction = <
    InputT extends z.ZodSchema,
    SuccessDataT extends z.ZodSchema,
    FailReasonT extends z.ZodSchema,
>(opts: {
    name: string;
    inputSchema: InputT;
    successDataSchema: SuccessDataT;
    failReasonSchema: FailReasonT;
    execute: DefineExecuteFunction<z.infer<InputT>, SuccessDataT, FailReasonT>;
}): Action<InputT, ActionOutcome<SuccessDataT, FailReasonT>> => {
    const ctx: ActionContext<SuccessDataT, FailReasonT> = {
        fail: (reason, message) => ({ outcome: { result: 'failure' as const, reason, message } }),
        succeed: (data, state?) => ({ state, outcome: { result: 'success' as const, data } }),
    };

    return {
        name: opts.name,
        inputSchema: opts.inputSchema,
        outcomeSchema: defineActionOutcome(opts.successDataSchema, opts.failReasonSchema),
        execute: (state, input) => opts.execute(state, input, ctx),
    };
};
