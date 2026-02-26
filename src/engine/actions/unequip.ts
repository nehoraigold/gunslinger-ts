import { defineAction } from './Action';
import { z } from 'zod';
import { EquipSlot, derivePlayerStats } from '../player';
import { produce } from 'immer';
import { ItemSchema, CombatStatsSchema } from './common/schema';
import { toItemSchema, equipFieldForType } from './common/utils';

export const UnequipAction = defineAction({
    name: 'unequip',
    inputSchema: z.object({
        slot: z.enum(['weapon', 'armor']) satisfies z.ZodType<EquipSlot>,
    }),
    successDataSchema: z.object({
        slot: z.enum(['weapon', 'armor']),
        previouslyEquipped: ItemSchema,
        combatStats: CombatStatsSchema,
    }),
    failReasonSchema: z.enum(['already_unequipped']),
    execute: (state, { slot }, { fail, succeed }) => {
        if (slot !== 'weapon' && slot !== 'armor') {
            throw new Error(`Cannot unequip unknown slot '${slot}'`);
        }

        const equippedField = equipFieldForType(slot);
        const previouslyEquippedItemId = state.player[equippedField];
        if (!previouslyEquippedItemId) {
            return fail('already_unequipped', `Player already has no ${slot} equipped`);
        }

        const previouslyEquippedItem = state.world.items[previouslyEquippedItemId];
        const nextState = produce(state, (draft) => {
            draft.player[equippedField] = null;
        });

        return succeed(
            {
                slot,
                previouslyEquipped: toItemSchema(previouslyEquippedItem),
                combatStats: derivePlayerStats(nextState.player, nextState.world.items),
            },
            nextState,
        );
    },
});
