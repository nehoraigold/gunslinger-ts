import { z } from 'zod';
import { produce } from 'immer';
import { defineEffectHandler } from '../defineEffectHandler';
import { applyItemUse } from '../applyItemUse';

export const RevealLoreEffectSchema = z.object({
    type: z.literal('revealLore'),
    text: z.string().describe('The lore text revealed'),
});

export const handleRevealLore = defineEffectHandler('revealLore', (ctx, effect) => {
    const { state, item, quantity } = ctx;

    const nextState = produce(state, (draft) => {
        applyItemUse(draft, item.id, quantity, item.consumedOnUse, state.turnCount);
        return draft;
    });

    return {
        state: nextState,
        outcome: {
            result: 'success',
            data: {
                effect,
                itemConsumed: item.consumedOnUse,
            },
        },
    };
});
