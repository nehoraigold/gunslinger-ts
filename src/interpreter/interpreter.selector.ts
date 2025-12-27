import { GameState } from '../engine';
import { InterpreterState, InterpreterItemState } from './interpreter.state';

const inventoryToVisibleItems = (inventoryId: string, state: GameState): InterpreterItemState[] => {
    const { inventories, items } = state.world;
    const inventory = inventories[inventoryId];
    if (!inventory) {
        return [];
    }
    return Object.entries(inventory.items)
        .map(([itemId, qty]): InterpreterItemState | null => {
            const item = items[itemId];
            if (!item) {
                return null;
            }
            return {
                name: item.name,
                aliases: item.aliases,
                quantity: qty,
            };
        })
        .filter((item) => !!item);
};

export const selectInterpreterGameState = (gameState: GameState): InterpreterState => {
    const { player, world } = gameState;
    const room = world.rooms[player.currentRoomId];

    if (!room) {
        throw new Error(`Invalid game state: room ${player.currentRoomId} not found`);
    }

    const inventory = inventoryToVisibleItems(player.inventoryId, gameState);
    const visibleItems = inventoryToVisibleItems(room.inventoryId, gameState);

    const visibleNPCs = room.npcIds
        .map((npcId) => world.npcs[npcId])
        .map((npc) => ({
            name: npc.name,
            aliases: npc.aliases,
            items: npc.inventoryId ? inventoryToVisibleItems(npc.inventoryId, gameState) : [],
        }));
    const visibleExits = Object.fromEntries(
        Object.entries(room.exits).map(([direction, exitState]) => {
            return [direction, world.rooms[exitState.toRoomId].name];
        }),
    );

    return {
        location: {
            name: room.name,
            description: room.description,
            visibleNPCs,
            visibleItems,
            visibleExits,
        },
        inventory,
    };
};
