import { produce } from 'immer';
import { defineEffectHandler } from '../defineEffectHandler';
import { consumeItem } from '../types';
import { createFlagEntry } from '../../common/utils';

export const handleUnlock = defineEffectHandler('unlock', ({ state, item, quantity }, effect) => {
    const { player, world } = state;
    const room = world.rooms[player.currentRoomId];

    const matchingExits = room.exits.filter(
        (e) => e.isBlocked && e.unlockCondition?.flagKey === effect.flagKey && e.unlockCondition.flagValue === true,
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

    const nextState = produce(state, (draft) => {
        draft.flags[effect.flagKey] = createFlagEntry(
            effect.flagKey,
            true,
            state.turnCount,
            state.flags[effect.flagKey]?.value ?? null,
        );

        for (const exit of draft.world.rooms[player.currentRoomId].exits) {
            if (
                exit.isBlocked &&
                exit.unlockCondition?.flagKey === effect.flagKey &&
                exit.unlockCondition.flagValue === true
            ) {
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
