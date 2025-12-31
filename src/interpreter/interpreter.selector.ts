import { GameState } from '../engine';
import { InterpreterState, InterpreterItemState } from './interpreter.state';
import { RoomState } from '../domain/room';
import { Direction } from 'node:tty';
import { evaluateCondition } from '../engine/condition';

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

const getVisibleExits = (room: RoomState, gameState: GameState): Partial<Record<Direction, string>> => {
    return Object.fromEntries(
        Object.entries(room.exits).map(([direction, exitId]) => {
            const exitState = gameState.world.exits[exitId];
            if (!exitState) {
                return [direction, undefined];
            }
            if (!evaluateCondition(gameState, exitState.visibility)) {
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

    const visibleNPCs = room.npcIds
        .map((npcId) => world.npcs[npcId])
        .map((npc) => ({
            name: npc.name,
            aliases: npc.aliases,
            items: npc.inventoryId ? inventoryToVisibleItems(npc.inventoryId, gameState) : [],
        }));
    const visibleExits = getVisibleExits(room, gameState);

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
