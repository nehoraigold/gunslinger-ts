import { EntityStore, ValueStore } from '../store';
import { PlayerState } from '../state/player';
import { ItemId, ItemState } from '../state/item';
import { RoomId, RoomState } from '../state/room';
import { GameState } from '../state/GameState';

export interface GameTransaction {
    player: ValueStore<PlayerState>;
    items: EntityStore<ItemId, ItemState>;
    rooms: EntityStore<RoomId, RoomState>;

    commit(): GameState;
}
