import { Player, Item, Room } from '../entity';
import { ItemId, RoomId } from '../state';

export interface Context {
    player(): Player;
    room(id: RoomId): Room | undefined;
    item(id: ItemId): Item | undefined;
}
