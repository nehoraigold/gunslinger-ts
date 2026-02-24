import { z } from 'zod';
import { GameState } from '../../engine/state/GameState';
import { ActionOutcome, defineActionOutcome } from './ActionOutcome';

export type ExecuteResult<OutcomeT> = { state?: GameState; outcome: OutcomeT };
export type ExecuteFunction<InputT, OutcomeT> = (state: GameState, input: InputT) => ExecuteResult<OutcomeT>;

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
    execute: ExecuteFunction<z.infer<InputT>, z.infer<ActionOutcome<SuccessDataT, FailReasonT>>>;
}): Action<InputT, ActionOutcome<SuccessDataT, FailReasonT>> => {
    return {
        name: opts.name,
        inputSchema: opts.inputSchema,
        outcomeSchema: defineActionOutcome(opts.successDataSchema, opts.failReasonSchema),
        execute: opts.execute,
    };
};
