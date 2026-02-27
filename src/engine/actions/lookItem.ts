import { z } from 'zod';
import { produce } from 'immer';
import { ItemSchema, ItemSummarySchema } from './common/schema';
import { defineAction } from './Action';
import { toItemSummary } from './common/utils';

const ItemLocationSchema = z.enum(['inventory', 'room', 'equipped']);

export const LookItemAction = defineAction({
    name: 'lookItem',
    inputSchema: z.object({
        itemId: z.string().describe('The item ID'),
    }),
    successDataSchema: ItemSchema.extend({
        location: ItemLocationSchema,
        quantity: z.number(),
        itemsRevealed: z
            .array(ItemSummarySchema)
            .optional()
            .describe('Items newly made visible by inspecting this item'),
    }),
    failReasonSchema: z.enum(['no_such_item', 'item_not_found']),
    execute: (state, { itemId }, { fail, succeed }) => {
        const { world, player } = state;
        const item = world.items[itemId];
        if (!item) {
            return fail('no_such_item', `No item with ID ${itemId}`);
        }

        const room = world.rooms[player.currentRoomId];
        if (!(itemId in room.items) && !(itemId in player.inventory)) {
            return fail('item_not_found', `${item.name} is not in the player's vicinity`);
        }

        const location: z.infer<typeof ItemLocationSchema> =
            itemId in player.inventory
                ? [player.equippedArmor, player.equippedWeapon].includes(itemId)
                    ? 'equipped'
                    : 'inventory'
                : 'room';
        const quantity = itemId in player.inventory ? player.inventory[itemId] : room.items[itemId];

        // Process onInspectEffect — currently only 'revealItem' is handled
        let nextState = state;
        let itemsRevealed: z.infer<typeof ItemSummarySchema>[] | undefined;

        if (item.onInspectEffect?.type === 'revealItem') {
            const revealId = item.onInspectEffect.itemId;
            const target = world.items[revealId];
            if (target) {
                nextState = produce(state, (draft) => {
                    draft.world.items[revealId].revealCondition = { type: 'true' };
                    return draft;
                });
                const summary = toItemSummary(nextState, revealId);
                if (summary) itemsRevealed = [{ ...summary, quantity: 1 }];
            }
        }

        return succeed({ ...item, location, quantity, revealedSecrets: [], itemsRevealed }, nextState);
    },
});
