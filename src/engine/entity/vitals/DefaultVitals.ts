import { Vitals } from './Vitals';
import { NegativeVitalsAmountError } from '../../error';

export class DefaultVitals implements Vitals {
    constructor(
        private readonly readCurrent: () => number,
        private readonly writeCurrent: (value: number) => void,
        private readonly readMax: () => number,
    ) {}

    current(): number {
        return this.readCurrent();
    }

    max(): number {
        return this.readMax();
    }

    isAlive(): boolean {
        return this.current() > 0;
    }

    heal(amount: number): void {
        this.requireNonNegative(amount);
        this.writeCurrent(Math.min(this.max(), this.current() + amount));
    }

    damage(amount: number): void {
        this.requireNonNegative(amount);
        this.writeCurrent(Math.max(0, this.current() - amount));
    }

    private requireNonNegative(amount: number): number {
        if (amount < 0) {
            throw new NegativeVitalsAmountError(amount);
        }
        return amount;
    }
}
