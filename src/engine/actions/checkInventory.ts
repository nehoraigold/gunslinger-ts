import { z } from 'zod';
import { ItemSchema } from './common/schema';
import { defineAction } from './Action';

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
    execute: (state) => {
        const itemRegistry = state.world.items;
        const inventory = state.player.inventory;
        const equippedWeaponId = state.player.equippedWeapon;
        const equippedArmorId = state.player.equippedArmor;

        const toItemSchema = (id: string, quantity: number) => {
            const item = itemRegistry[id];
            if (!item) {
                throw new Error(`Unable to find item with id ${id}`);
            }
            const { name, type, interactable, fullDescription, stats, usageHint } = item;
            return {
                id,
                name,
                fullDescription,
                type,
                stats,
                interactable,
                usageHint,
                revealedSecrets: [],
                quantity,
            };
        };

        return {
            state,
            outcome: {
                result: 'success',
                data: {
                    items: Object.entries(inventory).map(([id, quantity]) => toItemSchema(id, quantity)),
                    equippedWeapon: equippedWeaponId ? toItemSchema(equippedWeaponId, 1) : null,
                    equippedArmor: equippedArmorId ? toItemSchema(equippedArmorId, 1) : null,
                    gold: state.player.gold,
                },
            },
        };
    },
});
