import { GameState } from '../state';
import { TurnCounterStore, ItemsStore, NpcsStore, RoomsStore, PlayerStore } from '../store';
import { DeepReadonly } from '../../utils/types';

export interface Transaction {
    turnCounter: TurnCounterStore;
    player: PlayerStore;
    rooms: RoomsStore;
    items: ItemsStore;
    npcs: NpcsStore;

    commit(): DeepReadonly<GameState>;
}
