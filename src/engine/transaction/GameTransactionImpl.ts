import { GameState } from '../state/GameState';
import { EntityStoreImpl, ValueStoreImpl, EntityStore, ValueStore } from '../store';
import { PlayerState } from '../state/player';
import { ItemId, ItemState } from '../state/item';
import { RoomId, RoomState } from '../state/room';
import { GameTransaction } from './GameTransaction';

export class GameTransactionImpl implements GameTransaction {
    private readonly playerStore: ValueStore<PlayerState>;
    private readonly itemStore: EntityStore<ItemId, ItemState>;
    private readonly roomStore: EntityStore<RoomId, RoomState>;

    constructor(state: GameState) {
        this.playerStore = new ValueStoreImpl(state.player);
        this.itemStore = new EntityStoreImpl(state.items);
        this.roomStore = new EntityStoreImpl(state.rooms);
    }

    get player(): ValueStore<PlayerState> {
        return this.playerStore;
    }

    get items(): EntityStore<ItemId, ItemState> {
        return this.itemStore;
    }

    get rooms(): EntityStore<RoomId, RoomState> {
        return this.roomStore;
    }

    commit(): GameState {
        return {
            player: this.player.get(),
            items: this.items.getAll(),
            rooms: this.rooms.getAll(),
        };
    }
}
