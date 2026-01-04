import { GameState } from '../engine';
import { NarratorGameState, NarratorItemState, NarratorNPCState } from './narrator.state';

const inventoryToVisibleItems = (inventoryId: string, state: GameState): NarratorItemState[] => {
    const { inventories, items } = state.world;
    const inventory = inventories[inventoryId];
    if (!inventory) {
        return [];
    }
    return Object.entries(inventory.items)
        .map(([itemId, qty]): NarratorItemState | null => {
            const item = items[itemId];
            if (!item) {
                return null;
            }
            return {
                name: item.name,
                description: item.description,
                aliases: item.aliases,
                quantity: qty,
                uses: item.uses,
                transferable: item.transferable,
            };
        })
        .filter((item) => !!item);
};

export const selectNarratorGameState = (state: GameState): NarratorGameState => {
    const { player, world } = state;
    const room = world.rooms[player.currentRoomId];
    const playerInventory = inventoryToVisibleItems(player.inventoryId, state);
    const roomInventory = inventoryToVisibleItems(room.inventoryId, state);
    const npcs = room.npcIds
        .map((npcId) => world.npcs[npcId])
        .map((npc): NarratorNPCState => {
            return {
                name: npc.name,
                aliases: npc.aliases,
                description: npc.description,
                inventory: npc.inventoryId ? inventoryToVisibleItems(npc.inventoryId, state) : [],
                visibleTopics: Array.from(npc.topics.visibleTopics).map((topicId) => {
                    const { purpose } = npc.topics.definitions[topicId];
                    const { invokedCount } = npc.topics.state[topicId] ?? { invokedCount: 0 };
                    return {
                        id: topicId,
                        purpose,
                        invokedCount,
                    };
                }),
            };
        });
    const exits = Object.fromEntries(
        Object.entries(room.exits).map(([direction, exitId]) => {
            const exitState = world.exits[exitId];
            if (!exitState) {
                return [direction, undefined];
            }
            return [direction, world.rooms[exitState.toRoomId].name];
        }),
    );

    return {
        player: {
            inventory: playerInventory,
        },
        location: {
            name: room.name,
            description: room.description,
            visibleExits: exits,
            visibleNpcs: npcs,
            visibleItems: roomInventory,
        },
    };
};
