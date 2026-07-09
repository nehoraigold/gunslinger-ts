export class UnknownTransactionError extends Error {
    constructor() {
        super('The provided transaction is not the currently open one on this StateManager');
        this.name = 'UnknownTransactionError';
    }
}
