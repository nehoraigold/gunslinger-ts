import { z } from 'zod';
import { produce } from 'immer';
import { defineEffectHandler } from '../defineEffectHandler';
import { consumeItem } from '../consumeItem';

export const RevealItemEffectSchema = z.object({
    type: z.literal('revealItem'),
    itemId: z.string().describe('ID of the item to make visible'),
});

export const handleRevealItem = defineEffectHandler('revealItem', ({ state, item, quantity }, effect) => {
    const target = state.world.items[effect.itemId];
    if (!target) {
        return {
            outcome: {
                result: 'failure',
                reason: 'no_such_item',
                message: `No item with ID ${effect.itemId}`,
            },
        };
    }

    const nextState = produce(state, (draft) => {
        draft.world.items[effect.itemId].revealCondition = { type: 'true' };
        consumeItem(draft, item.id, quantity, item.consumedOnUse, state.turnCount);
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
