import { TurnCounter } from './TurnCounter';
import { TurnCounterStore } from '../../store';

export class DefaultTurnCounter implements TurnCounter {
    constructor(private readonly store: TurnCounterStore) {}

    currentTick(): number {
        return this.store.get().count;
    }

    advance(): void {
        this.store.update((counter) => {
            counter.count += 1;
        });
    }
}
