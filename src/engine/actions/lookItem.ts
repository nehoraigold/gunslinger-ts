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
        return succeed({ ...item, location, quantity, revealedSecrets: [] }, state);
    },
});
