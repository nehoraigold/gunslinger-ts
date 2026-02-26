import { z } from 'zod';
import { produce } from 'immer';

import { defineAction, ActionContext } from './Action';
import { ItemTypeSchema } from './common/schema';
import { toItemSummary } from './common/utils';
import { GameState } from '../state/GameState';
import { Npc } from '../npc';
import { Item } from '../item';

const TradeItemSchema = z.object({
    id: z.string(),
    name: z.string(),
    shortDesc: z.string(),
    type: ItemTypeSchema,
});

const tradeSuccessDataSchema = z.object({
    direction: z.enum(['buy', 'sell']),
    item: TradeItemSchema,
    quantity: z.number(),
    pricePerUnit: z.number(),
    totalPrice: z.number(),
    playerGoldAfter: z.number(),
    npcGoldAfter: z.number(),
});

const tradeFailReasonSchema = z.enum([
    'npc_not_found',
    'npc_not_in_room',
    'npc_unavailable',
    'item_not_found',
    'not_for_sale',
    'insufficient_npc_stock',
    'insufficient_player_gold',
    'item_not_in_inventory',
    'insufficient_player_stock',
    'item_not_sellable',
    'npc_cannot_afford',
]);

type TradeItemSummary = z.infer<typeof TradeItemSchema>;
type TradeCtx = ActionContext<typeof tradeSuccessDataSchema, typeof tradeFailReasonSchema>;

function toTradeItem(state: GameState, itemId: string): TradeItemSummary {
    const s = toItemSummary(state, itemId)!;
    return { id: s.id, name: s.name, shortDesc: s.shortDesc, type: s.type };
}

function executeBuy(
    state: GameState,
    npcId: string,
    npc: Npc,
    itemId: string,
    item: Item,
    quantity: number,
    { fail, succeed }: TradeCtx,
) {
    const npcEntry = npc.inventory.find((e) => e.itemId === itemId && e.forSale);
    if (!npcEntry || !npcEntry.price) {
        return fail('not_for_sale', `${npc.name} does not sell ${item.name}`);
    }

    if (npcEntry.quantity < quantity) {
        return fail('insufficient_npc_stock', `${npc.name} only has ${npcEntry.quantity} of ${item.name}`);
    }

    const totalPrice = npcEntry.price * quantity;
    if (state.player.gold < totalPrice) {
        return fail('insufficient_player_gold', `You need ${totalPrice} gold but only have ${state.player.gold}`);
    }

    const nextState = produce(state, (draft) => {
        draft.player.gold -= totalPrice;
        draft.world.npcs[npcId].gold += totalPrice;

        const entry = draft.world.npcs[npcId].inventory.find((e) => e.itemId === itemId && e.forSale);
        if (entry) {
            entry.quantity -= quantity;
            if (entry.quantity === 0) {
                draft.world.npcs[npcId].inventory = draft.world.npcs[npcId].inventory.filter(
                    (e) => !(e.itemId === itemId && e.forSale),
                );
            }
        }
        draft.player.inventory[itemId] = (draft.player.inventory[itemId] ?? 0) + quantity;
    });

    return succeed(
        {
            direction: 'buy' as const,
            item: toTradeItem(nextState, itemId),
            quantity,
            pricePerUnit: npcEntry.price,
            totalPrice,
            playerGoldAfter: nextState.player.gold,
            npcGoldAfter: nextState.world.npcs[npcId].gold,
        },
        nextState,
    );
}

function executeSell(
    state: GameState,
    npcId: string,
    npc: Npc,
    itemId: string,
    item: Item,
    quantity: number,
    { fail, succeed }: TradeCtx,
) {
    if (!item.droppable) {
        return fail('item_not_sellable', `${item.name} cannot be sold`);
    }

    const playerCount = state.player.inventory[itemId] ?? 0;
    if (playerCount === 0) {
        return fail('item_not_in_inventory', `You do not have ${item.name} in your inventory`);
    }

    if (playerCount < quantity) {
        return fail('insufficient_player_stock', `You only have ${playerCount} of ${item.name}`);
    }

    const totalPrice = item.value * quantity;
    if (npc.gold < totalPrice) {
        return fail('npc_cannot_afford', `${npc.name} cannot afford ${totalPrice} gold for ${item.name}`);
    }

    const nextState = produce(state, (draft) => {
        draft.player.gold += totalPrice;
        draft.world.npcs[npcId].gold -= totalPrice;

        const newPlayerCount = playerCount - quantity;
        if (newPlayerCount === 0) {
            delete draft.player.inventory[itemId];
        } else {
            draft.player.inventory[itemId] = newPlayerCount;
        }

        const existingEntry = draft.world.npcs[npcId].inventory.find((e) => e.itemId === itemId);
        if (existingEntry) {
            existingEntry.quantity += quantity;
        } else {
            draft.world.npcs[npcId].inventory.push({ itemId, quantity, forSale: false });
        }
    });

    return succeed(
        {
            direction: 'sell' as const,
            item: toTradeItem(nextState, itemId),
            quantity,
            pricePerUnit: item.value,
            totalPrice,
            playerGoldAfter: nextState.player.gold,
            npcGoldAfter: nextState.world.npcs[npcId].gold,
        },
        nextState,
    );
}

export const TradeAction = defineAction({
    name: 'trade',
    inputSchema: z.object({
        npcId: z.string().describe('The ID of the NPC to trade with'),
        direction: z
            .enum(['buy', 'sell'])
            .describe('buy = player acquires item from NPC; sell = player gives item to NPC'),
        itemId: z.string().describe('The item to buy or sell'),
        quantity: z.number().min(1).optional().describe('How many to trade (defaults to 1)'),
    }),
    successDataSchema: tradeSuccessDataSchema,
    failReasonSchema: tradeFailReasonSchema,
    execute: (state, { npcId, direction, itemId, quantity = 1 }, ctx) => {
        const { world, player } = state;
        const { fail } = ctx;

        const npc = world.npcs[npcId];
        if (!npc) {
            return fail('npc_not_found', `No NPC with ID ${npcId}`);
        }

        if (!world.rooms[player.currentRoomId].npcIds.includes(npcId)) {
            return fail('npc_not_in_room', `${npc.name} is not here`);
        }

        if (!npc.isAlive || npc.isHostile) {
            return fail('npc_unavailable', `${npc.name} is not available for trade`);
        }

        const item = world.items[itemId];
        if (!item) {
            return fail('item_not_found', `No item with ID ${itemId}`);
        }

        switch (direction) {
            case 'buy':
                return executeBuy(state, npcId, npc, itemId, item, quantity, ctx);
            case 'sell':
                return executeSell(state, npcId, npc, itemId, item, quantity, ctx);
        }
    },
});
