import { PlayerState } from './player';
import { ItemId, ItemState } from './item';
import { RoomId } from './room/RoomId';
import { RoomState } from './room/RoomState';

export type GameState = {
    player: PlayerState;
    items: Record<ItemId, ItemState>;
    rooms: Record<RoomId, RoomState>;
};
