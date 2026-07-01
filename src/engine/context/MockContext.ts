import { Context } from './Context';
import { ItemId, RoomId } from '../state';
import { Item, Player, Room } from '../entity';
import { MockPlayer } from '../entity/player/MockPlayer';

export type MockContextOptions = {
    player?: Player;
    rooms?: Record<RoomId, Room>;
    items?: Record<ItemId, Item>;
};

export class MockContext implements Context {
    private readonly _player: Player;
    private readonly rooms: Record<RoomId, Room>;
    private readonly items: Record<RoomId, Item>;

    constructor(opts?: MockContextOptions) {
        this._player = opts?.player ?? new MockPlayer();
        this.rooms = opts?.rooms ?? {};
        this.items = opts?.items ?? {};
    }

    item(id: ItemId): Item | undefined {
        return this.items[id];
    }

    player(): Player {
        return this._player;
    }

    room(id: RoomId): Room | undefined {
        return this.rooms[id];
    }
}
