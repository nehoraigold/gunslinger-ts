import { GameState } from '../state';
import { DefaultKeyedValueStore, ItemsStore, NpcsStore, PlayerStore, RoomsStore, RootValueStore } from '../store';
import { Transaction } from './Transaction';
import { DeepReadonly, cloneMutable } from '../../utils/types';

export class GameTransaction implements Transaction {
    private readonly playerStore: PlayerStore;
    private readonly roomStore: RoomsStore;
    private readonly itemStore: ItemsStore;
    private readonly npcStore: NpcsStore;

    constructor(state: DeepReadonly<GameState>) {
        const initial = cloneMutable<GameState>(state);
        this.playerStore = new RootValueStore(initial.player);
        this.itemStore = new DefaultKeyedValueStore(initial.items);
        this.npcStore = new DefaultKeyedValueStore(initial.npcs);
        this.roomStore = new DefaultKeyedValueStore(initial.rooms);
    }

    get player(): PlayerStore {
        return this.playerStore;
    }

    get items(): ItemsStore {
        return this.itemStore;
    }

    get npcs(): NpcsStore {
        return this.npcStore;
    }

    get rooms(): RoomsStore {
        return this.roomStore;
    }

    commit(): DeepReadonly<GameState> {
        return {
            player: this.playerStore.get(),
            items: this.itemStore.getAll(),
            npcs: this.npcStore.getAll(),
            rooms: this.roomStore.getAll(),
        };
    }
}
