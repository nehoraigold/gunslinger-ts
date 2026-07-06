export class NegativeWalletBalanceError extends Error {
    constructor(amount: number) {
        super(`Wallet amount must be non-negative, got ${amount}`);
        this.name = 'NegativeWalletBalanceError';
    }
}
