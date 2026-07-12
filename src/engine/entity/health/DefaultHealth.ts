import { Health } from './Health';
import { HealthStore } from '../../store';
import { NegativeHealthAmountError } from '../../error';

export class DefaultHealth implements Health {
    constructor(private readonly store: HealthStore) {}

    current(): number {
        return this.store.get().current;
    }

    max(): number {
        return this.store.get().max;
    }

    isAlive(): boolean {
        return this.current() > 0;
    }

    heal(amount: number): void {
        this.requireNonNegative(amount);
        this.store.update((draft) => {
            draft.current = Math.min(draft.max, draft.current + amount);
        });
    }

    damage(amount: number): void {
        this.requireNonNegative(amount);
        this.store.update((draft) => {
            draft.current = Math.max(0, draft.current - amount);
        });
    }

    private requireNonNegative(amount: number): number {
        if (amount < 0) {
            throw new NegativeHealthAmountError(amount);
        }
        return amount;
    }
}
