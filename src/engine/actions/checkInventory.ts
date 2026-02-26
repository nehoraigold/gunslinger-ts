import { z } from 'zod';
import { ItemSchema } from './common/schema';
import { defineAction } from './Action';
import { toItemSchema } from './common/utils';

export const CheckInventoryAction = defineAction({
    name: 'checkInventory',
    inputSchema: z.void(),
    successDataSchema: z.object({
        items: z.array(ItemSchema.extend({ quantity: z.number() })),
        equippedWeapon: ItemSchema.nullable(),
        equippedArmor: ItemSchema.nullable(),
        gold: z.number(),
    }),
    failReasonSchema: z.never(),
    execute: (state, _, { succeed }) => {
        const { world, player } = state;

        return succeed(
            {
                items: Object.entries(player.inventory).map(([id, quantity]) => {
                    const item = world.items[id];
                    if (!item) throw new Error(`Unable to find item with id ${id}`);
                    return { ...toItemSchema(item), quantity };
                }),
                equippedWeapon: player.equippedWeapon ? toItemSchema(world.items[player.equippedWeapon]!) : null,
                equippedArmor: player.equippedArmor ? toItemSchema(world.items[player.equippedArmor]!) : null,
                gold: player.gold,
            },
            state,
        );
    },
});
