import { Repository } from './Repository';
import { GameTransaction } from '../../transaction';
import { ItemId } from '../../state/item';
import { RoomId } from '../../state/room';
import { Item, ItemFactory } from '../item';
import { Room, RoomFactory } from '../room';
import { Player, PlayerImpl } from '../player';
import { KeyedValueStore, ValueStore } from '../../store';

type EntityCache = {
    player?: Player;
    rooms: Record<RoomId, Room>;
    items: Record<ItemId, Item>;
};

type Factories = {
    item: ItemFactory;
    room: RoomFactory;
};

export class EntityRepository implements Repository {
    private readonly cache: EntityCache;

    constructor(
        private readonly tx: GameTransaction,
        private readonly factories: Factories,
    ) {
        this.cache = {
            rooms: {},
            items: {},
        };
    }

    player(): Player {
        if (!this.cache.player) {
            this.cache.player = new PlayerImpl(this.tx.player);
        }
        return this.cache.player;
    }

    item(id: ItemId): Item | undefined {
        return this.getOrCreateEntity(this.cache.items, id, this.tx.items, this.factories.item.create);
    }

    room(id: RoomId): Room | undefined {
        return this.getOrCreateEntity(this.cache.rooms, id, this.tx.rooms, this.factories.room.create);
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
