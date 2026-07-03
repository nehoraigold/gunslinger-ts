import { GameState } from '../state/GameState';
import { ItemsStore, RoomsStore, PlayerStore } from '../store';
import { DeepReadonly } from '../../utils/types';

export interface Transaction {
    player: PlayerStore;
    rooms: RoomsStore;
    items: ItemsStore;

    commit(): DeepReadonly<GameState>;
}
