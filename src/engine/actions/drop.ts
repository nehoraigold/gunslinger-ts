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
    execute: (state, { itemId, quantity }) => {
        const { world, player } = state;
        const item = world.items[itemId];
        if (!item) {
            return {
                outcome: {
                    result: 'failure',
                    reason: 'no_such_item',
                    message: `No item with ID ${itemId}`,
                } as const,
            };
        }

        const currentCount = player.inventory[itemId];
        if (!currentCount) {
            return {
                outcome: {
                    result: 'failure',
                    reason: 'item_not_in_inventory',
                    message: `You have no ${item.name} in your inventory`,
                } as const,
            };
        }

        quantity ??= 1;
        if (quantity > currentCount) {
            return {
                outcome: {
                    result: 'failure',
                    reason: 'insufficient_quantity',
                    message: `You cannot drop ${quantity} of ${item.name} when you only have ${currentCount}`,
                } as const,
            };
        }

        if (!item.droppable) {
            return {
                outcome: {
                    result: 'failure',
                    reason: 'unable_to_drop',
                    message: `Item ${item.name} is not droppable`,
                } as const,
            };
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

        return {
            state: nextState,
            outcome: {
                result: 'success',
                data: {
                    item: {
                        id: item.id,
                        name: item.name,
                        fullDescription: item.fullDescription,
                        type: item.type,
                        stats: item.stats,
                        interactable: item.interactable,
                        usageHint: item.usageHint,
                        revealedSecrets: [],
                    },
                    droppedInRoomId: player.currentRoomId,
                    wasEquipped,
                    inventoryCount: nextState.player.inventory[itemId] ?? 0,
                },
            },
        };
    },
});
