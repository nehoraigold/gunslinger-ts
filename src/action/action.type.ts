export enum ActionType {
    MOVE = "move", // move in a direction (north, south, east, west)
    LOOK = "look", // examine the current room you're in
    TRANSFER = "transfer", // move an item from the player's inventory to another inventory (room, npc) or vice versa
    INTERACT = "interact", // interact with an npc or item (without transferring)
    INVENTORY = "inventory", // inspect your current inventory
    HELP = "help", // display help screen
    QUIT = "quit", // quit the game
    UNKNOWN = "unknown" // action could not be determined
}