import { z } from 'zod';
import { produce } from 'immer';
import { defineAction } from './Action';
import { FlagValueSchema } from './common/schema';
import { createFlagEntry } from './common/utils';

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
    execute: (state, { key, value }, { succeed }) => {
        const previousValue = state.flags[key]?.value ?? null;

        const nextState = produce(state, (draft) => {
            draft.flags[key] = createFlagEntry(key, value, state.turnCount, previousValue);
            return draft;
        });

        return succeed({ key, value, previousValue }, nextState);
    },
});
