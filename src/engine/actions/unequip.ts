import { defineAction } from './Action';
import { z } from 'zod';
import { EquipSlot } from '../player';
import { produce } from 'immer';
import { toItemSummary } from './common/utils';
import { ItemSchema, PlayerStatsSchema } from './common/schema';

export const UnequipAction = defineAction({
    name: 'unequip',
    inputSchema: z.object({
        slot: z.enum(['weapon', 'armor']) satisfies z.ZodType<EquipSlot>,
    }),
    successDataSchema: z.object({
        slot: z.enum(['weapon', 'armor']),
        previouslyEquipped: ItemSchema,
        newStats: PlayerStatsSchema,
    }),
    failReasonSchema: z.enum(['already_unequipped']),
    execute: (state, { slot }) => {
        if (slot !== 'weapon' && slot !== 'armor') {
            throw new Error(`Cannot unequip unknown slot '${slot}'`);
        }

        const equippedField = slot === 'weapon' ? 'equippedWeapon' : 'equippedArmor';
        const previouslyEquippedItemId = state.player[equippedField];
        if (!previouslyEquippedItemId) {
            return {
                outcome: {
                    result: 'failure',
                    reason: 'already_unequipped',
                    message: `Player already has no ${slot} equipped`,
                } as const,
            };
        }

        const previouslyEquippedItem = state.world.items[previouslyEquippedItemId];
        const nextState = produce(state, (draft) => {
            draft.player[equippedField] = null;
        });
        return {
            state: nextState,
            outcome: {
                result: 'success',
                data: {
                    slot,
                    previouslyEquipped: {
                        ...toItemSummary(nextState, previouslyEquippedItemId)!,
                        fullDescription: previouslyEquippedItem.fullDescription,
                        revealedSecrets: [],
                        stats: previouslyEquippedItem.stats,
                    },
                    newStats: nextState.player.stats,
                },
            },
        };
    },
});
