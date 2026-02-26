import { z } from 'zod';
import { ItemSchema } from './common/schema';
import { defineAction } from './Action';
import { produce } from 'immer';

export const DropAction = defineAction({
    name: 'drop',
    inputSchema: z.object({
        itemId: z.string(),
        quantity: z.number().min(1).optional(),
    }),
    successDataSchema: z.object({
        item: ItemSchema,
        droppedInRoomId: z.string(),
        wasEquipped: z.boolean(),
        inventoryCount: z.number(),
    }),
    failReasonSchema: z.enum(['no_such_item', 'item_not_in_inventory', 'insufficient_quantity', 'unable_to_drop']),
    execute: (state, { itemId, quantity }, { fail, succeed }) => {
        const { world, player } = state;
        const item = world.items[itemId];
        if (!item) {
            return fail('no_such_item', `No item with ID ${itemId}`);
        }

        const currentCount = player.inventory[itemId];
        if (!currentCount) {
            return fail('item_not_in_inventory', `You have no ${item.name} in your inventory`);
        }

        quantity ??= 1;
        if (quantity > currentCount) {
            return fail(
                'insufficient_quantity',
                `You cannot drop ${quantity} of ${item.name} when you only have ${currentCount}`,
            );
        }

        if (!item.droppable) {
            return fail('unable_to_drop', `Item ${item.name} is not droppable`);
        }

        let wasEquipped = false;
        const nextState = produce(state, (draft) => {
            // add item count to current room
            draft.world.rooms[draft.player.currentRoomId].items[itemId] =
                (draft.world.rooms[draft.player.currentRoomId].items[itemId] ?? 0) + quantity;

            // remove item count from player inventory
            const oldCount = player.inventory[itemId];
            const newCount = oldCount - quantity;
            draft.player.inventory[itemId] = newCount;
            if (newCount === 0) {
                delete draft.player.inventory[itemId];
                if (draft.player.equippedArmor === itemId) {
                    draft.player.equippedArmor = null;
                    wasEquipped = true;
                }
                if (draft.player.equippedWeapon === itemId) {
                    draft.player.equippedWeapon = null;
                    wasEquipped = true;
                }
            }
            return draft;
        });

        return succeed(
            {
                item: {
                    id: item.id,
                    name: item.name,
                    fullDescription: item.fullDescription,
                    type: item.type,
                    stats: item.stats,
                    useEffect: item.useEffect,
                    consumedOnUse: item.consumedOnUse,
                    usageHint: item.usageHint,
                    revealedSecrets: [],
                },
                droppedInRoomId: player.currentRoomId,
                wasEquipped,
                inventoryCount: nextState.player.inventory[itemId] ?? 0,
            },
            nextState,
        );
    },
});
