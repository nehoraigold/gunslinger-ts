import { z } from 'zod';

export const defineActionOutcome = <SuccessDataT, FailureReasonT>(
    successDataSchema: SuccessDataT,
    failureReasonSchema: FailureReasonT,
) => {
    return z.discriminatedUnion('result', [
        z.object({
            result: z.literal('success'),
            data: successDataSchema,
        }),
        z.object({
            result: z.literal('failure'),
            reason: failureReasonSchema,
            message: z.string().optional(),
        }),
    ]);
};

export type ActionOutcome<SuccessDataT, FailureReasonT> = ReturnType<
    typeof defineActionOutcome<SuccessDataT, FailureReasonT>
>;
