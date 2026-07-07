import { Context } from './Context';
import { Transaction } from '../transaction';
import { ItemId, NpcId, RoomId } from '../state';
import {
    Item,
    ItemFactory,
    Npc,
    NpcFactory,
    Room,
    RoomFactory,
    Player,
    DefaultPlayer,
    TurnCounter,
    DefaultTurnCounter,
} from '../entity';
import { KeyedValueStore, ValueStore } from '../store';
import { ItemNotFoundError, NpcNotFoundError, RoomNotFoundError } from '../error';

type EntityCache = {
    turnCounter?: TurnCounter;
    player?: Player;
    rooms: Record<RoomId, Room>;
    items: Record<ItemId, Item>;
    npcs: Record<NpcId, Npc>;
};

export type Factories = {
    item: ItemFactory;
    npc: NpcFactory;
    room: RoomFactory;
};

export class GameContext implements Context {
    private readonly cache: EntityCache;

    constructor(
        private readonly tx: Transaction,
        private readonly factories: Factories,
    ) {
        this.cache = {
            rooms: {},
            items: {},
            npcs: {},
        };
    }

    turnCounter(): TurnCounter {
        if (!this.cache.turnCounter) {
            this.cache.turnCounter = new DefaultTurnCounter(this.tx.turnCounter);
        }
        return this.cache.turnCounter;
    }

    player(): Player {
        if (!this.cache.player) {
            this.cache.player = new DefaultPlayer(this.tx.player);
        }
        return this.cache.player;
    }

    item(id: ItemId): Item | undefined {
        return this.getOrCreateEntity(this.cache.items, id, this.tx.items, this.factories.item.create);
    }

    requireItem(id: ItemId): Item {
        const item = this.item(id);
        if (!item) {
            throw new ItemNotFoundError(id);
        }
        return item;
    }

    npc(id: NpcId): Npc | undefined {
        return this.getOrCreateEntity(this.cache.npcs, id, this.tx.npcs, this.factories.npc.create);
    }

    requireNpc(id: NpcId): Npc {
        const npc = this.npc(id);
        if (!npc) {
            throw new NpcNotFoundError(id);
        }
        return npc;
    }

    room(id: RoomId): Room | undefined {
        return this.getOrCreateEntity(this.cache.rooms, id, this.tx.rooms, this.factories.room.create);
    }

    requireRoom(id: RoomId): Room {
        const room = this.room(id);
        if (!room) {
            throw new RoomNotFoundError(id);
        }
        return room;
    }

    requireCurrentRoom(): Room {
        return this.requireRoom(this.player().currentRoomId);
    }

    private getOrCreateEntity<Id extends string, State, Entity>(
        cache: Record<Id, Entity>,
        id: Id,
        store: KeyedValueStore<Id, State>,
        factory: (id: Id, store: ValueStore<State>) => Entity,
    ): Entity | undefined {
        const cached = cache[id];
        if (cached) {
            return cached;
        }

        const valueStore = store.store(id);
        if (!valueStore) {
            return undefined;
        }

        const entity = factory(id, valueStore);
        cache[id] = entity;
        return entity;
    }
}
