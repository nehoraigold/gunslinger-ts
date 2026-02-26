import { produce } from 'immer';
import { healthValueToProse } from '../../../state/utils';
import { defineEffectHandler } from '../defineEffectHandler';
import { consumeItem } from '../types';

export const handleHeal = defineEffectHandler('heal', ({ state, item, quantity }, effect) => {
    const { player } = state;

    if (player.health >= player.maxHealth) {
        return {
            outcome: {
                result: 'failure',
                reason: 'already_at_full_health',
                message: `Using ${item.name} would have no effect, player already at full health`,
            },
        };
    }

    const newHealth = Math.min(player.health + effect.value, player.maxHealth);
    const nextState = produce(state, (draft) => {
        draft.player.health = newHealth;
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
                newPlayerHealth: healthValueToProse({ health: newHealth, maxHealth: player.maxHealth }),
            },
        },
    };
});
