import { z } from 'zod';
import { produce } from 'immer';
import { defineEffectHandler } from '../defineEffectHandler';
import { applyItemUse } from '../applyItemUse';
import { defeatEnemy } from '../../common/utils';
import { healthValueToProse } from '../../../state/utils';
import { isAlive } from '../../../npc';
import { Item } from '../../../item';

export const DamageEffectSchema = z.object({
    type: z.literal('damage'),
    value: z.number().describe('HP dealt to target'),
});

export const handleDamage = defineEffectHandler('damage', ({ state, item, quantity, targetId }, effect) => {
    if (!targetId) {
        return {
            outcome: {
                result: 'failure',
                reason: 'no_target',
                message: `${item.name} requires a target — specify a target NPC ID`,
            },
        };
    }

    const npc = state.world.npcs[targetId];
    if (!npc) {
        return {
            outcome: {
                result: 'failure',
                reason: 'npc_not_found',
                message: `No NPC with ID ${targetId}`,
            },
        };
    }

    const room = state.world.rooms[state.player.currentRoomId];
    if (!room.npcIds.includes(targetId)) {
        return {
            outcome: {
                result: 'failure',
                reason: 'npc_not_in_room',
                message: `${npc.name} is not in the current room`,
            },
        };
    }

    if (!isAlive(npc)) {
        return {
            outcome: {
                result: 'failure',
                reason: 'npc_already_dead',
                message: `${npc.name} is already dead`,
            },
        };
    }

    const newHealth = Math.max(0, npc.health - effect.value);
    const targetDefeated = newHealth === 0;

    const lootEntries: { item: Item; quantity: number }[] = [];
    if (targetDefeated) {
        for (const entry of npc.lootTable) {
            if (Math.random() < entry.dropChance) {
                const lootItem = state.world.items[entry.itemId];
                if (lootItem) {
                    lootEntries.push({ item: lootItem, quantity: entry.quantity });
                }
            }
        }
    }

    const nextState = produce(state, (draft) => {
        draft.world.npcs[targetId].health = newHealth;
        if (targetDefeated) {
            defeatEnemy(draft, targetId, lootEntries);
        }
        applyItemUse(draft, item.id, quantity, item.consumedOnUse, state.turnCount);
        return draft;
    });

    return {
        state: nextState,
        outcome: {
            result: 'success',
            data: {
                effect,
                itemConsumed: item.consumedOnUse,
                targetHealthProse: healthValueToProse({ health: newHealth, maxHealth: npc.maxHealth }),
                targetDefeated,
                xpGained: targetDefeated ? npc.xpValue : undefined,
            },
        },
    };
});
