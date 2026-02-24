import { produce } from 'immer';

import { GameState } from './GameState';

export class StateManager {
    private state: GameState;
    private inTransaction: boolean;

    constructor(initialState: GameState) {
        this.state = initialState;
        this.inTransaction = false;
    }

    beginTransaction(): GameState {
        if (this.inTransaction) {
            throw new Error('beginTransaction() called while in transaction');
        }
        this.inTransaction = true;
        return this.getState();
    }

    commit(state: GameState) {
        if (!this.inTransaction) {
            throw new Error('commit() called with no active transaction');
        }

        this.state = produce(state, (draft) => {
            draft.turnCount++;
        });
        this.inTransaction = false;
    }

    rollback() {
        if (!this.inTransaction) {
            throw new Error('rollback() called with no active transaction');
        }
        this.inTransaction = false;
    }

    getState() {
        return structuredClone(this.state);
    }
}
