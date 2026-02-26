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
    execute: (state, { itemId, targetId }) => {
        const { player, world } = state;

        const item = world.items[itemId];
        if (!item) {
            return {
                outcome: {
                    result: 'failure',
                    reason: 'no_such_item',
                    message: `Item with ID ${itemId} does not exist`,
                },
            };
        }

        const quantity = player.inventory[itemId];
        if (!quantity) {
            return {
                outcome: {
                    result: 'failure',
                    reason: 'item_not_in_inventory',
                    message: `${item.name} is not in your inventory`,
                },
            };
        }

        if (!item.useEffect) {
            return {
                outcome: {
                    result: 'failure',
                    reason: 'item_not_usable',
                    message: `${item.name} cannot be used`,
                },
            };
        }

        const ctx: EffectHandlerContext = { state, item, quantity, targetId };
        return resolveEffect(ctx, item.useEffect);
    },
});
