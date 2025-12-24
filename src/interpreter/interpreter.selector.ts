import { GameState } from '../engine';
import { InterpreterGameState } from './interpreter.game.state';

export const selectInterpreterGameState = (gameState: GameState): InterpreterGameState => {
    const { player, world } = gameState;
    const room = world.rooms[player.currentRoomId];

    if (!room) {
        throw new Error(`Invalid game state: room ${player.currentRoomId} not found`);
    }

    const roomInventory = world.inventories[room.inventoryId];

    const visibleItems = roomInventory
        ? Object.entries(roomInventory.items).map(([itemId, quantity]) => {
              const item = world.items[itemId];
              return {
                  name: item.name,
                  aliases: item.aliases,
                  quantity,
              };
          })
        : [];

    const playerInventory = world.inventories[player.inventoryId];

    const inventory = Object.entries(playerInventory.items).map(([itemId, quantity]) => {
        const item = world.items[itemId];
        return {
            name: item.name,
            aliases: item.aliases,
            quantity,
        };
    });

    const visibleNPCs = room.npcIds
        .map((npcId) => world.npcs[npcId])
        .map((npc) => ({
            name: npc.name,
            aliases: npc.aliases,
        }));

    return {
        location: {
            name: room.name,
            description: room.visited ? undefined : room.description,
        },
        visibleNPCs,
        visibleItems,
        inventory,
    };
};
