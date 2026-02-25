import { z } from 'zod';
import { ItemSchema } from './common/schema';
import { defineActionOutcome } from './ActionOutcome';
import { defineAction } from './Action';

const ItemLocationSchema = z.enum(['inventory', 'room', 'equipped']);

export const LookItemAction = defineAction({
    name: 'lookItem',
    inputSchema: z.object({
        itemId: z.string().describe('The item ID'),
    }),
    successDataSchema: ItemSchema.extend({
        location: ItemLocationSchema,
        quantity: z.number(),
    }),
    failReasonSchema: z.enum(['item_not_found', 'item_not_in_room']),
    execute: (state, { itemId }) => {
        const { world, player } = state;
        const item = world.items[itemId];
        if (!item) {
            return {
                outcome: {
                    result: 'failure',
                    reason: 'item_not_found',
                    message: `No item with ID ${itemId}`,
                } as const,
            };
        }

        const room = world.rooms[player.currentRoomId];
        if (!(itemId in room.items) && !(itemId in player.inventory)) {
            return {
                outcome: {
                    result: 'failure',
                    reason: 'item_not_in_room',
                    message: `${item.name} is not in the player's vicinity`,
                } as const,
            };
        }

        const location: z.infer<typeof ItemLocationSchema> =
            itemId in player.inventory
                ? [player.equippedArmor, player.equippedWeapon].includes(itemId)
                    ? 'equipped'
                    : 'inventory'
                : 'room';
        const quantity = itemId in player.inventory ? player.inventory[itemId] : room.items[itemId];
        return {
            state,
            outcome: {
                result: 'success',
                data: { ...item, location, quantity, revealedSecrets: [] },
            },
        };
    },
});
