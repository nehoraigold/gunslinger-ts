import { z } from 'zod';
import { defineAction } from './Action';
import { produce } from 'immer';
import { toItemSchema } from './common/utils';
import { ItemSchema } from './common/schema';

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
    execute: (state, { itemId, quantity }, { fail, succeed }) => {
        const { world, player } = state;
        const item = world.items[itemId];
        if (!item) {
            return fail('no_such_item', `No item with ID ${itemId}`);
        }

        const room = world.rooms[player.currentRoomId];
        if (!(itemId in room.items) || room.items[itemId] === 0) {
            return fail('item_not_found', `No ${item.name} found`);
        }

        if (!item.takeable) {
            return fail('unable_to_pick_up', `You cannot pick up ${item.name}`);
        }

        quantity ??= 1;
        if (room.items[itemId] < quantity) {
            return fail(
                'insufficient_quantity',
                `You cannot pick up ${quantity} of ${item.name} when only ${room.items[itemId]} present`,
            );
        }

        const nextState = produce(state, (draft) => {
            draft.player.inventory[itemId] = (draft.player.inventory[itemId] ?? 0) + quantity;
            draft.world.rooms[room.id].items[itemId] = draft.world.rooms[room.id].items[itemId] - quantity;
            if (draft.world.rooms[room.id].items[itemId] === 0) {
                delete draft.world.rooms[room.id].items[itemId];
            }
            return draft;
        });
        return succeed(
            {
                item: toItemSchema(item),
                inventoryCount: nextState.player.inventory[itemId],
            },
            nextState,
        );
    },
});
