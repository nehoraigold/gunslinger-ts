import { z } from 'zod';
import { produce } from 'immer';
import { defineAction } from './Action';
import { FlagValueSchema } from './common/schema';

export const SetFlagAction = defineAction({
    name: 'setFlag',
    inputSchema: z.object({
        key: z.string().describe('The flag key to set'),
        value: FlagValueSchema.describe('The value to assign'),
    }),
    successDataSchema: z.object({
        key: z.string(),
        value: FlagValueSchema,
        previousValue: FlagValueSchema.nullable().describe('The value before this set, or null if new'),
    }),
    failReasonSchema: z.never(),
    execute: (state, { key, value }) => {
        const existing = state.flags[key];
        const previousValue = existing ? existing.value : null;

        const nextState = produce(state, (draft) => {
            draft.flags[key] = {
                key,
                value,
                setAtTurn: state.turnCount,
                previousValue: previousValue ?? null,
            };
            return draft;
        });

        return {
            state: nextState,
            outcome: {
                result: 'success',
                data: {
                    key,
                    value,
                    previousValue,
                },
            },
        };
    },
});
