import { Direction, directionToCoordinate } from "../action";
import { GameState } from "../engine";
import { addCoordinates } from "../utils";

export const move = (gameState: GameState, direction: Direction): GameState => {
    const newCoordinate = addCoordinates(gameState.player.location, directionToCoordinate(direction));
    return {
        ...gameState,
        player: {
            ...gameState.player,
            location: newCoordinate,
        },
    };
}