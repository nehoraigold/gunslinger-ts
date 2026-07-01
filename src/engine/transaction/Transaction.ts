import { GameState } from '../state/GameState';
import { ItemsStore, RoomsStore, PlayerStore } from '../store';

export interface Transaction {
    player: PlayerStore;
    rooms: RoomsStore;
    items: ItemsStore;

    commit(): GameState;
}
