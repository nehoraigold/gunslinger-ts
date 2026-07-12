export class NegativeVitalsAmountError extends Error {
    constructor(amount: number) {
        super(`Vitals amount must be non-negative, got ${amount}`);
        this.name = 'NegativeVitalsAmountError';
    }
}
