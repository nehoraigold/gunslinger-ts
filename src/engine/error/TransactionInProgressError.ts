export class TransactionInProgressError extends Error {
    constructor(operation: string) {
        super(`Cannot ${operation} while a transaction is in progress`);
        this.name = 'TransactionInProgressError';
    }
}
