import { GameState } from '../state/GameState';
import { DefaultKeyedValueStore, ItemsStore, PlayerStore, RoomsStore, RootValueStore } from '../store';
import { GameTransaction } from './GameTransaction';

export class GameTransactionImpl implements GameTransaction {
    private readonly playerStore: PlayerStore;
    private readonly roomStore: RoomsStore;
    private readonly itemStore: ItemsStore;

    constructor(state: GameState) {
        this.playerStore = new RootValueStore(state.player);
        this.itemStore = new DefaultKeyedValueStore(state.items);
        this.roomStore = new DefaultKeyedValueStore(state.rooms);
    }

    get player(): PlayerStore {
        return this.playerStore;
    }

    get items(): ItemsStore {
        return this.itemStore;
    }

    get rooms(): RoomsStore {
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
