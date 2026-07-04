import { z } from 'zod';
import { Context } from '../context';
import { ExecuteFunction } from './ExecuteFunction';
import { ActionOutcome, defineActionOutcome } from './ActionOutcome';
import { Verdict } from './Verdict';

type DefineExecuteFunction<InputT, SuccessDataT extends z.ZodSchema, FailReasonT extends z.ZodSchema> = (
    ctx: Context,
    input: InputT,
    verdict: Verdict<SuccessDataT, FailReasonT>,
) => z.infer<ActionOutcome<SuccessDataT, FailReasonT>>;

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
    const verdict: Verdict<SuccessDataT, FailReasonT> = {
        fail: (reason, message) => ({ result: 'failure' as const, reason, message }),
        succeed: (data) => ({ result: 'success' as const, data }),
    };

    return {
        name: opts.name,
        inputSchema: opts.inputSchema,
        outcomeSchema: defineActionOutcome(opts.successDataSchema, opts.failReasonSchema),
        execute: (ctx, input) => opts.execute(ctx, input, verdict),
    };
};
