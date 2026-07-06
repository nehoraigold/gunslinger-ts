import { Clock } from './Clock';
import { ClockStore } from '../../store';

export class DefaultClock implements Clock {
    constructor(private readonly store: ClockStore) {}

    currentTurn(): number {
        return this.store.get().turn;
    }

    advance(): void {
        this.store.update((clock) => {
            clock.turn += 1;
        });
    }
}
