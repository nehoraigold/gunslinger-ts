import { GameState } from '../state';
import { ItemsStore, NpcsStore, RoomsStore, PlayerStore } from '../store';
import { DeepReadonly } from '../../utils/types';

export interface Transaction {
    player: PlayerStore;
    rooms: RoomsStore;
    items: ItemsStore;
    npcs: NpcsStore;

    commit(): DeepReadonly<GameState>;
}
