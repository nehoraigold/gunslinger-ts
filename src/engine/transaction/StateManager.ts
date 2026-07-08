import { Transaction } from './Transaction';
import { GameTransaction } from './GameTransaction';
import { GameState } from '../state';
import { DeepReadonly } from '../../utils/types';

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
            throw new Error('restore() called while a transaction is open');
        }
        this.state = state;
    }

    beginTransaction(): Transaction {
        if (this.openTx) {
            throw new Error('beginTransaction() called while a transaction is already open');
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
            throw new Error('tx is not the currently open transaction on this StateManager');
        }
    }
}
