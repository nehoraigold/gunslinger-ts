import { Transaction } from './Transaction';
import { GameTransaction } from './GameTransaction';
import { GameState } from '../state';
import { DeepReadonly } from '../../utils/types';
import { TransactionInProgressError, UnknownTransactionError } from '../error';

export class StateManager {
    private state: DeepReadonly<GameState>;
    private openTx: Transaction | null = null;

    constructor(initialState: GameState) {
        this.state = initialState;
    }

    getState(): DeepReadonly<GameState> {
        return this.state;
    }

    restore(state: GameState): void {
        if (this.openTx) {
            throw new TransactionInProgressError('restore state');
        }
        this.state = state;
    }

    beginTransaction(): Transaction {
        if (this.openTx) {
            throw new TransactionInProgressError('begin a transaction');
        }
        this.openTx = new GameTransaction(this.state);
        return this.openTx;
    }

    commit(tx: Transaction): void {
        this.assertOpen(tx);
        this.state = tx.commit();
        this.openTx = null;
    }

    rollback(tx: Transaction): void {
        this.assertOpen(tx);
        this.openTx = null;
    }

    private assertOpen(tx: Transaction): void {
        if (tx !== this.openTx) {
            throw new UnknownTransactionError();
        }
    }
}
