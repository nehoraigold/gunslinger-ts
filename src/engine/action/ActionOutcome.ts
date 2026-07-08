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

export const ActionOutcome = {
    succeed<SuccessDataT>(data: SuccessDataT) {
        return { result: 'success' as const, data };
    },
    fail<FailReasonT>(reason: FailReasonT, message?: string) {
        return { result: 'failure' as const, reason, message };
    },
};
