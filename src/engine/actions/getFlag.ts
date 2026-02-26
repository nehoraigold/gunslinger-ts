import { z } from 'zod';
import { defineAction } from './Action';
import { FlagValueSchema } from './common/schema';

export const GetFlagAction = defineAction({
    name: 'getFlag',
    inputSchema: z.object({
        key: z.string().describe('The flag key to look up'),
    }),
    successDataSchema: z.object({
        key: z.string(),
        value: FlagValueSchema,
        setAtTurn: z.number().describe('The turn number when this flag was last set'),
        previousValue: FlagValueSchema.nullable().describe('The value before the last set, or null'),
    }),
    failReasonSchema: z.enum(['flag_not_found']),
    execute: (state, { key }) => {
        const entry = state.flags[key];
        if (!entry) {
            return {
                outcome: {
                    result: 'failure',
                    reason: 'flag_not_found',
                    message: `No flag found with key "${key}"`,
                } as const,
            };
        }

        return {
            outcome: {
                result: 'success',
                data: {
                    key: entry.key,
                    value: entry.value,
                    setAtTurn: entry.setAtTurn,
                    previousValue: entry.previousValue ?? null,
                },
            },
        };
    },
});
