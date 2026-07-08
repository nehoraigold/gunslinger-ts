import { PlayerState } from './player';
import { ItemId, ItemState } from './item';
import { NpcId, NpcState } from './npc';
import { RoomId, RoomState } from './room';
import { TurnCounterState } from './turn';
import { FlagsState } from './flags';

export type GameState = {
    turnCounter: TurnCounterState;
    flags: FlagsState;
    player: PlayerState;
    items: Record<ItemId, ItemState>;
    npcs: Record<NpcId, NpcState>;
    rooms: Record<RoomId, RoomState>;
};
