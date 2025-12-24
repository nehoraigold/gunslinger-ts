import { PlayerState } from "../domain/player/player.state";
import { WorldState } from "../domain/world/world.state";

export type GameState = {
    player: PlayerState;
    world: WorldState;
}