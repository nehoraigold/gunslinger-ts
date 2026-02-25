import { z } from 'zod';
import { ItemSchema } from './common/schema';
import { defineAction } from './Action';
import { produce } from 'immer';

export const PickUpAction = defineAction({
    name: 'pickUp',
    inputSchema: z.object({
        itemId: z.string(),
        quantity: z.number().min(1).optional(),
    }),
    successDataSchema: z.object({
        item: ItemSchema,
        inventoryCount: z.number(),
    }),
    failReasonSchema: z.enum([
        'no_such_item',
        'item_not_found',
        'insufficient_quantity',
        'too_heavy',
        'unable_to_pick_up',
    ]),
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

        const room = world.rooms[player.currentRoomId];
        if (!(itemId in room.items) || room.items[itemId] === 0) {
            return {
                outcome: {
                    result: 'failure',
                    reason: 'item_not_found',
                    message: `No ${item.name} found`,
                } as const,
            };
        }

        if (!item.interactable) {
            return {
                outcome: {
                    result: 'failure',
                    reason: 'unable_to_pick_up',
                    message: `You cannot pick up ${item.name}`,
                } as const,
            };
        }

        quantity ??= 1;
        if (room.items[itemId] < quantity) {
            return {
                outcome: {
                    result: 'failure',
                    reason: 'insufficient_quantity',
                    message: `You cannot pick up ${quantity} of ${item.name} when only ${room.items[itemId]} present`,
                } as const,
            };
        }

        const nextState = produce(state, (draft) => {
            // add to player inventory
            draft.player.inventory[itemId] = (draft.player.inventory[itemId] ?? 0) + quantity;

            // remove from room items
            draft.world.rooms[room.id].items[itemId] = draft.world.rooms[room.id].items[itemId] - quantity;
            if (draft.world.rooms[room.id].items[itemId] === 0) {
                delete draft.world.rooms[room.id].items[itemId];
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
                    inventoryCount: nextState.player.inventory[itemId],
                },
            },
        };
    },
});
