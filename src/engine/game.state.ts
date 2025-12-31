import { PlayerState } from '../domain/player';
import { WorldState } from '../domain/world';

export type GameState = {
    player: PlayerState;
    world: WorldState;
};
