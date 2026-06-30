import { GameState } from '../state/GameState';
import { EntityStoreImpl, ItemStore, PlayerStore, RoomStore, ValueStoreImpl } from '../store';
import { GameTransaction } from './GameTransaction';

export class GameTransactionImpl implements GameTransaction {
    private readonly playerStore: PlayerStore;
    private readonly roomStore: RoomStore;
    private readonly itemStore: ItemStore;

    constructor(state: GameState) {
        this.playerStore = new ValueStoreImpl(state.player);
        this.itemStore = new EntityStoreImpl(state.items);
        this.roomStore = new EntityStoreImpl(state.rooms);
    }

    player(): PlayerStore {
        return this.playerStore;
    }

    items(): ItemStore {
        return this.itemStore;
    }

    rooms(): RoomStore {
        return this.roomStore;
    }

    commit(): GameState {
        return {
            player: this.playerStore.get(),
            items: this.itemStore.getAll(),
            rooms: this.roomStore.getAll(),
        };
    }
}
