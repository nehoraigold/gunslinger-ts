import { Player } from '../domain/player';
import { World } from '../domain/world';

export type GameState = {
    player: Player;
    world: World;
};
