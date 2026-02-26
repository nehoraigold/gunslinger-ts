import { z } from 'zod';
import { produce } from 'immer';

import { EquipSlot, derivePlayerStats } from '../player';
import { ItemSchema, CombatStatsSchema } from './common/schema';
import { toItemSummary } from './common/utils';
import { defineAction } from './Action';

export const EquipAction = defineAction({
    name: 'equip',
    inputSchema: z.object({
        itemId: z.string(),
    }),
    successDataSchema: z.object({
        item: ItemSchema,
        slot: z.enum(['weapon', 'armor']) satisfies z.ZodType<EquipSlot>,
        previouslyEquipped: ItemSchema.nullable(),
        combatStats: CombatStatsSchema,
    }),
    failReasonSchema: z.enum(['no_such_item', 'item_not_found', 'wrong_type', 'stat_requirement_not_met']),
    execute: (state, { itemId }, { fail, succeed }) => {
        const { player, world } = state;
        const item = world.items[itemId];
        if (!item) {
            return fail('no_such_item', `Item with ID ${itemId} does not exist`);
        }

        if (!player.inventory[itemId]) {
            return fail('item_not_found', `Item ${item.name} not found in player inventory`);
        }

        if (item.type !== 'armor' && item.type !== 'weapon') {
            return fail('wrong_type', `Item ${item.name} has type ${item.type}, not weapon or armor`);
        }

        // TODO: Check stats requirement

        const equippedField = item.type === 'armor' ? 'equippedArmor' : 'equippedWeapon';
        const previouslyEquippedItem = player[equippedField] ? world.items[player[equippedField]] : null;
        const nextState = produce(state, (draft) => {
            draft.player[equippedField] = itemId;
            return draft;
        });
        return succeed(
            {
                item: {
                    ...toItemSummary(nextState, itemId)!,
                    fullDescription: item.fullDescription,
                    revealedSecrets: [],
                    stats: item.stats,
                    consumedOnUse: item.consumedOnUse,
                },
                slot: item.type,
                previouslyEquipped: previouslyEquippedItem
                    ? {
                          ...toItemSummary(nextState, previouslyEquippedItem.id)!,
                          fullDescription: previouslyEquippedItem.fullDescription,
                          revealedSecrets: [],
                          stats: previouslyEquippedItem.stats,
                          consumedOnUse: previouslyEquippedItem.consumedOnUse,
                      }
                    : null,
                combatStats: derivePlayerStats(nextState.player, nextState.world.items),
            },
            nextState,
        );
    },
});
