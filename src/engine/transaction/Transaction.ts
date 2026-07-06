import { GameState } from '../state';
import { ClockStore, ItemsStore, NpcsStore, RoomsStore, PlayerStore } from '../store';
import { DeepReadonly } from '../../utils/types';

export interface Transaction {
    clock: ClockStore;
    player: PlayerStore;
    rooms: RoomsStore;
    items: ItemsStore;
    npcs: NpcsStore;

    commit(): DeepReadonly<GameState>;
}
