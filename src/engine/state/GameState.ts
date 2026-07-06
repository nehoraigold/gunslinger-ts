import { PlayerState } from './player';
import { ItemId, ItemState } from './item';
import { NpcId, NpcState } from './npc';
import { RoomId, RoomState } from './room';

export type GameState = {
    player: PlayerState;
    items: Record<ItemId, ItemState>;
    npcs: Record<NpcId, NpcState>;
    rooms: Record<RoomId, RoomState>;
};
