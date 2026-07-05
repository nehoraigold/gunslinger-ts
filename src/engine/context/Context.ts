import { Player, Item, Room } from '../entity';
import { ItemId, RoomId } from '../state';

export interface Context {
    player(): Player;
    room(id: RoomId): Room | undefined;
    requireRoom(id: RoomId): Room;
    item(id: ItemId): Item | undefined;
    requireItem(id: ItemId): Item;
    requireCurrentRoom(): Room;
}
