export class NegativeWalletAmountError extends Error {
    constructor(amount: number) {
        super(`Wallet amount must be non-negative, got ${amount}`);
        this.name = 'NegativeWalletBalanceError';
    }
}
