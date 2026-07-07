import { TurnCounter } from './TurnCounter';
import { TurnCounterStore } from '../../store';

export class DefaultTurnCounter implements TurnCounter {
    constructor(private readonly store: TurnCounterStore) {}

    current(): number {
        return this.store.get().count;
    }

    increment(): void {
        this.store.update((counter) => {
            counter.count += 1;
        });
    }
}
