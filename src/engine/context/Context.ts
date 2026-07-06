import { Player, Item, Npc, Room, Clock } from '../entity';
import { ItemId, NpcId, RoomId } from '../state';

export interface Context {
    clock(): Clock;
    player(): Player;
    room(id: RoomId): Room | undefined;
    requireRoom(id: RoomId): Room;
    item(id: ItemId): Item | undefined;
    requireItem(id: ItemId): Item;
    npc(id: NpcId): Npc | undefined;
    requireNpc(id: NpcId): Npc;
    requireCurrentRoom(): Room;
}
