import { GameState, evaluateCondition, Direction } from '../engine';
import { InterpreterState, InterpreterItemState, InterpreterInventory, InterpreterNPCState } from './interpreter.state';
import { Room } from '../domain/room';

const inventoryToVisibleItems = (inventoryId: string, state: GameState): InterpreterInventory => {
    const { inventories, items } = state.world;
    const inventory = inventories[inventoryId];
    if (!inventory) {
        return {
            id: inventoryId,
            items: [],
        };
    }
    const visibleItems = Object.entries(inventory.items)
        .map(([itemId, qty]): InterpreterItemState | null => {
            const item = items[itemId];
            if (!item) {
                return null;
            }
            return {
                id: item.id,
                name: item.name,
                aliases: item.aliases,
                quantity: qty,
            };
        })
        .filter((item) => !!item);
    return {
        id: inventoryId,
        items: visibleItems,
    };
};

const getVisibleExits = (room: Room, gameState: GameState): Partial<Record<Direction, string>> => {
    return Object.fromEntries(
        Object.entries(room.exits).map(([direction, exitId]) => {
            const exitState = gameState.world.exits[exitId];
            if (!exitState) {
                return [direction, undefined];
            }
            const isVisible = evaluateCondition(gameState, exitState.visibility);
            if (!isVisible.ok) {
                return [direction, undefined];
            }
            return [direction, gameState.world.rooms[exitState.toRoomId].name];
        }),
    );
};

export const selectInterpreterGameState = (gameState: GameState): InterpreterState => {
    const { player, world } = gameState;
    const room = world.rooms[player.currentRoomId];

    if (!room) {
        throw new Error(`Invalid game state: room ${player.currentRoomId} not found`);
    }

    const inventory = inventoryToVisibleItems(player.inventoryId, gameState);
    const visibleItems = inventoryToVisibleItems(room.inventoryId, gameState);

    const visibleNPCs: InterpreterNPCState[] = room.npcIds
        .map((npcId) => world.npcs[npcId])
        .map((npc) => ({
            id: npc.id,
            name: npc.name,
            aliases: npc.aliases,
            inventory: inventoryToVisibleItems(npc.inventoryId, gameState),
        }));
    const visibleExits = getVisibleExits(room, gameState);

    return {
        room: {
            id: room.id,
            name: room.name,
            description: room.description,
            inventory: visibleItems,
        },
        visibleNPCs,
        visibleExits,
        player: {
            name: player.name,
            description: player.description,
            inventory: inventory,
        },
    };
};
