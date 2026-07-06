export class InsufficientWalletBalanceError extends Error {
    constructor(amount: number, balance: number) {
        super(`Cannot debit ${amount} from a balance of ${balance}`);
        this.name = 'InsufficientWalletBalanceError';
    }
}
