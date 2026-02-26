import { z } from 'zod';
import { defineAction } from '../Action';
import { successDataSchema, failReasonSchema, EffectHandlerContext } from './types';
import { resolveEffect } from './registry';

export const UseItemAction = defineAction({
    name: 'useItem',
    inputSchema: z.object({
        itemId: z.string(),
        targetId: z.string().optional().describe('Target NPC ID for damage or poison effects'),
    }),
    successDataSchema,
    failReasonSchema,
    execute: (state, { itemId, targetId }, { fail }) => {
        const { player, world } = state;

        const item = world.items[itemId];
        if (!item) {
            return fail('no_such_item', `Item with ID ${itemId} does not exist`);
        }

        const quantity = player.inventory[itemId];
        if (!quantity) {
            return fail('item_not_in_inventory', `${item.name} is not in your inventory`);
        }

        if (!item.useEffect) {
            return fail('item_not_usable', `${item.name} cannot be used`);
        }

        const ctx: EffectHandlerContext = { state, item, quantity, targetId };
        return resolveEffect(ctx, item.useEffect);
    },
});
