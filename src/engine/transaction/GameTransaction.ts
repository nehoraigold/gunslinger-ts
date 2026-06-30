import { GameState } from '../state/GameState';
import { ItemStore, RoomStore, PlayerStore } from '../store';

export interface GameTransaction {
    player(): PlayerStore;
    rooms(): RoomStore;
    items(): ItemStore;

    commit(): GameState;
}
