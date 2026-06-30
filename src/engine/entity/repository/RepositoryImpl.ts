import { Repository } from './Repository';
import { GameTransaction } from '../../transaction';
import { ItemId } from '../../state/item';
import { RoomId } from '../../state/room';
import { Item } from '../item';
import { Room, RoomImpl } from '../room';
import { Player, PlayerImpl } from '../player';

type EntityCache = {
    player?: Player;
    rooms: Record<RoomId, Room>;
    items: Record<ItemId, Item>;
};

export class RepositoryImpl implements Repository {
    private readonly cache: EntityCache;

    constructor(private readonly tx: GameTransaction) {
        this.cache = {
            rooms: {},
            items: {},
        };
    }

    player(): Player {
        if (!this.cache.player) {
            this.cache.player = new PlayerImpl(this.tx.player());
        }
        return this.cache.player;
    }

    item(id: ItemId): Item | undefined {
        return undefined;
    }

    room(id: RoomId): Room | undefined {
        if (this.cache.rooms[id]) {
            return this.cache.rooms[id];
        }
        if (!this.tx.rooms().get(id)) {
            return undefined;
        }
        const room = new RoomImpl(id, this.tx.rooms());
        this.cache.rooms[id] = room;
        return room;
    }
}
