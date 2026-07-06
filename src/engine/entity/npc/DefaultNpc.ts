import { Npc } from './Npc';
import { NpcId } from '../../state';
import { NpcStore } from '../../store';

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
}
