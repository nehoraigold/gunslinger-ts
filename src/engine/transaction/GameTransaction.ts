import { GameState } from '../state';
import { DefaultKeyedValueStore, ItemsStore, PlayerStore, RoomsStore, RootValueStore } from '../store';
import { Transaction } from './Transaction';
import { DeepReadonly, cloneMutable } from '../../utils/types';

export class GameTransaction implements Transaction {
    private readonly playerStore: PlayerStore;
    private readonly roomStore: RoomsStore;
    private readonly itemStore: ItemsStore;

    constructor(state: DeepReadonly<GameState>) {
        const initial = cloneMutable<GameState>(state);
        this.playerStore = new RootValueStore(initial.player);
        this.itemStore = new DefaultKeyedValueStore(initial.items);
        this.roomStore = new DefaultKeyedValueStore(initial.rooms);
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

    commit(): DeepReadonly<GameState> {
        return {
            player: this.playerStore.get(),
            items: this.itemStore.getAll(),
            rooms: this.roomStore.getAll(),
        };
    }
}
