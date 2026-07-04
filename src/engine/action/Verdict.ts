import { z } from 'zod';
import { ActionOutcome } from './ActionOutcome';

export type Verdict<SuccessDataT extends z.ZodSchema, FailReasonT extends z.ZodSchema> = {
    fail: (reason: z.infer<FailReasonT>, message?: string) => z.infer<ActionOutcome<SuccessDataT, FailReasonT>>;
    succeed: (data: z.infer<SuccessDataT>) => z.infer<ActionOutcome<SuccessDataT, FailReasonT>>;
};
