import { GameState, evaluateCondition, Direction } from '../engine';
import {
    InterpreterInput,
    InterpreterItemState,
    InterpreterInventory,
    InterpreterNPCState,
    InterpreterExit,
} from './interpreter.input';
import { Room } from '../domain/room';

export const generateInterpreterInput = (playerText: string, gameState: GameState): InterpreterInput => {
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
            visibleTopics: Array.from(npc.topics.visibleTopics),
        }));
    const visibleExits = getVisibleExits(room, gameState);

    const state = {
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
    return {
        action_text: playerText,
        game_state: state,
    };
};

const inventoryToVisibleItems = (inventoryId: string, state: GameState) => {
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
                use_verbs: item.uses.flatMap((use) => [use.verb, ...use.aliases]),
            };
        })
        .filter((item) => !!item);
    return {
        id: inventoryId,
        items: visibleItems,
    } satisfies InterpreterInventory;
};

const getVisibleExits = (room: Room, gameState: GameState): Partial<Record<Direction, InterpreterExit>> => {
    return Object.fromEntries(
        Object.entries(room.exits).map(([direction, exitId]) => {
            const exit = gameState.world.exits[exitId];
            if (!exit) {
                return [direction, undefined];
            }
            const isVisible = evaluateCondition(gameState, exit.visibility);
            if (!isVisible.ok) {
                return [direction, undefined];
            }
            return [
                direction,
                {
                    id: exit.id,
                    type: exit.type,
                    direction: exit.direction,
                    toRoomId: exit.toRoomId,
                },
            ];
        }),
    );
};
