//region imports
import { Coordinate } from "./types/utils/Coordinate";
import { IRoom } from "./types/locations/IRoom";
import { World } from "./locations/World";
import { Room } from "./locations/Room";
import { Player } from "./characters/Player";
import { ActionParser } from "./actions/parsers/ActionParser";
import { ActionHandler } from "./actions/handlers/ActionHandler";
import { GetUserInput } from "./utils/utils";
import { Print } from "./utils/print";

//endregion

async function main() {
    const worldMap = new Map<Coordinate, IRoom>();
    const WORLD_DIMENSIONS = 10;
    for (let i = 0; i < WORLD_DIMENSIONS; i++) {
        for (let j = 0; j < WORLD_DIMENSIONS; j++) {
            worldMap.set({ X: i, Y: j }, new Room(`(${i},${j})`));
        }
    }
    const world = new World(worldMap);
    const player = new Player("Roland", { X: 1, Y: 5 });
    const currentRoom = world.GetRoom(player.Location) as IRoom;
    const actionParser = new ActionParser();
    const actionHandler = new ActionHandler(world, player);
    Print.Message(currentRoom.Visit());
    while (true) {
        try {
            const action = actionParser.Parse(await GetUserInput());
            Print.NewLine();
            await actionHandler.Handle(action, currentRoom);
        } catch (e) {
            Print.Message(e);
        }
    }
}

main();
