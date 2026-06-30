import { Player } from '../player';
import { RoomId } from '../../state/room';
import { Room } from '../room';
import { ItemId } from '../../state/item';
import { Item } from '../item';

export interface Repository {
    player(): Player;
    room(id: RoomId): Room | undefined;
    item(id: ItemId): Item | undefined;
}
