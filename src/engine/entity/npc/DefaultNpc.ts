import { Npc } from './Npc';
import { NpcId, NpcMood } from '../../state';
import { NpcStore } from '../../store';
import { Wallet, DefaultWallet } from '../wallet';

export class DefaultNpc implements Npc {
    constructor(
        public readonly id: NpcId,
        private readonly store: NpcStore,
    ) {}

    get name(): string {
        return this.store.get().name;
    }

    get appearance(): string {
        return this.store.get().appearance;
    }

    get dialogue(): string {
        return this.store.get().dialogue;
    }

    get mood(): NpcMood {
        return this.store.get().mood;
    }

    isAlive(): boolean {
        return this.store.get().health > 0;
    }

    wallet(): Wallet {
        return new DefaultWallet(
            () => this.store.get().money,
            (money) =>
                this.store.update((state) => {
                    state.money = money;
                }),
        );
    }
}
