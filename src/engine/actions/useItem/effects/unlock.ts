import { z } from 'zod';
import { produce } from 'immer';
import { defineEffectHandler } from '../defineEffectHandler';
import { consumeItem } from '../consumeItem';
import { createFlagEntry } from '../../common/utils';
import { evaluateCondition } from '../../../condition';

export const UnlockEffectSchema = z.object({
    type: z.literal('unlock'),
    flagKey: z.string().describe('Flag set to true in game state'),
});

export const handleUnlock = defineEffectHandler('unlock', ({ state, item, quantity }, effect) => {
    const { player, world } = state;
    const room = world.rooms[player.currentRoomId];

    // Simulate setting the flag to find which exits would be unblocked
    const stateWithFlag = produce(state, (draft) => {
        draft.flags[effect.flagKey] = createFlagEntry(
            effect.flagKey,
            true,
            state.turnCount,
            state.flags[effect.flagKey]?.value ?? null,
        );
    });

    const matchingExits = room.exits.filter(
        (e) => e.isBlocked && e.unlockCondition && evaluateCondition(stateWithFlag, e.unlockCondition),
    );

    if (matchingExits.length === 0) {
        return {
            outcome: {
                result: 'failure',
                reason: 'wrong_key',
                message: `${item.name} does not unlock anything here`,
            },
        };
    }

    const nextState = produce(stateWithFlag, (draft) => {
        for (const exit of draft.world.rooms[player.currentRoomId].exits) {
            if (exit.isBlocked && exit.unlockCondition && evaluateCondition(stateWithFlag, exit.unlockCondition)) {
                exit.isBlocked = false;
            }
        }
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
                unlockedExits: matchingExits.map((e) => e.direction),
            },
        },
    };
});
