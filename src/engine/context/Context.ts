import { Player, Item, Npc, Room, TurnCounter } from '../entity';
import { ItemId, NpcId, RoomId } from '../state';

export interface Context {
    turnCounter(): TurnCounter;
    player(): Player;
    room(id: RoomId): Room | undefined;
    requireRoom(id: RoomId): Room;
    item(id: ItemId): Item | undefined;
    requireItem(id: ItemId): Item;
    npc(id: NpcId): Npc | undefined;
    requireNpc(id: NpcId): Npc;
    requireCurrentRoom(): Room;
}
