import { GameState } from '../state';
import { TurnCounterStore, FlagsStore, ItemsStore, NpcsStore, RoomsStore, PlayerStore } from '../store';
import { DeepReadonly } from '../../utils/types';

export interface Transaction {
    turnCounter: TurnCounterStore;
    flags: FlagsStore;
    player: PlayerStore;
    rooms: RoomsStore;
    items: ItemsStore;
    npcs: NpcsStore;

    commit(): DeepReadonly<GameState>;
}
