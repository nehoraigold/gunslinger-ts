import { Wallet } from './Wallet';
import { InsufficientWalletBalanceError, NegativeWalletBalanceError } from '../../error';

export class DefaultWallet implements Wallet {
    constructor(
        private readonly read: () => number,
        private readonly write: (balance: number) => void,
    ) {}

    balance(): number {
        return this.read();
    }

    canAfford(amount: number): boolean {
        return this.balance() >= this.requireNonNegative(amount);
    }

    credit(amount: number): void {
        this.write(this.balance() + this.requireNonNegative(amount));
    }

    debit(amount: number): void {
        this.requireNonNegative(amount);
        if (!this.canAfford(amount)) {
            throw new InsufficientWalletBalanceError(amount, this.balance());
        }
        this.write(this.balance() - amount);
    }

    private requireNonNegative(amount: number): number {
        if (amount < 0) {
            throw new NegativeWalletBalanceError(amount);
        }
        return amount;
    }
}
