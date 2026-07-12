export class NegativeHealthAmountError extends Error {
    constructor(amount: number) {
        super(`Health amount must be non-negative, got ${amount}`);
        this.name = 'NegativeHealthAmountError';
    }
}
