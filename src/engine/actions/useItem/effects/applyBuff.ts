import { z } from 'zod';
import { produce } from 'immer';
import { defineEffectHandler } from '../defineEffectHandler';
import { applyItemUse } from '../applyItemUse';

export const ApplyBuffEffectSchema = z.object({
    type: z.literal('applyBuff'),
    effectId: z.string(),
    name: z.string(),
    description: z.string(),
    duration: z.number().describe('Number of turns the buff lasts'),
});

export const handleApplyBuff = defineEffectHandler('applyBuff', ({ state, item, quantity }, effect) => {
    const nextState = produce(state, (draft) => {
        // Remove any existing instance of this buff before re-applying
        draft.player.activeEffects = draft.player.activeEffects.filter((e) => e.id !== effect.effectId);
        draft.player.activeEffects.push({
            id: effect.effectId,
            name: effect.name,
            description: effect.description,
            turnsRemaining: effect.duration,
        });
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
