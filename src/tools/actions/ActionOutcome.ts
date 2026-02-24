import { z } from 'zod';

export const defineActionOutcome = <SuccessT, FailureReasonT>(
    successSchema: SuccessT,
    failureReasonSchema: FailureReasonT,
) => {
    return z.discriminatedUnion('result', [
        z.object({
            result: z.literal('success'),
            data: successSchema,
        }),
        z.object({
            result: z.literal('failure'),
            reason: failureReasonSchema,
            message: z.string().optional(),
        }),
    ]);
};
