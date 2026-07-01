import { PlayerState } from './player';
import { ItemId, ItemState } from './item';
import { RoomId, RoomState } from './room';

export type GameState = {
    player: PlayerState;
    items: Record<ItemId, ItemState>;
    rooms: Record<RoomId, RoomState>;
};
