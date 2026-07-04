import { describe, it } from 'mocha';
import { expect } from 'chai';

import { StateManager } from './StateManager';
import { GameTransaction } from './GameTransaction';
import { createGameState } from '../state/GameState.test.utils';

describe(StateManager.name, () => {
    describe('getState', () => {
        it('should return the initial state before any transaction is committed', () => {
            const initialState = createGameState();
            const manager = new StateManager(initialState);

            expect(manager.getState()).to.deep.equal(initialState);
        });
    });

    describe('beginTransaction', () => {
        it('should return a transaction reflecting the current state', () => {
            const manager = new StateManager(createGameState());

            const tx = manager.beginTransaction();

            expect(tx.player.get().currentRoomId).to.equal('room_1');
        });

        it('should throw if called while a transaction is already open', () => {
            const manager = new StateManager(createGameState());
            manager.beginTransaction();

            expect(() => manager.beginTransaction()).to.throw(/already open/i);
        });

        it('should allow beginning a new transaction after the previous one was committed', () => {
            const manager = new StateManager(createGameState());
            const tx = manager.beginTransaction();
            manager.commit(tx);

            expect(() => manager.beginTransaction()).to.not.throw();
        });

        it('should allow beginning a new transaction after the previous one was rolled back', () => {
            const manager = new StateManager(createGameState());
            const tx = manager.beginTransaction();
            manager.rollback(tx);

            expect(() => manager.beginTransaction()).to.not.throw();
        });
    });

    describe('commit', () => {
        it('should update the state returned by getState to reflect the committed transaction', () => {
            const manager = new StateManager(createGameState());
            const tx = manager.beginTransaction();
            tx.player.update((player) => (player.currentRoomId = 'room_2'));

            manager.commit(tx);

            expect(manager.getState().player.currentRoomId).to.equal('room_2');
        });

        it('should throw when passed a transaction that is not the currently open one', () => {
            const manager = new StateManager(createGameState());
            const foreignTx = new GameTransaction(createGameState());

            expect(() => manager.commit(foreignTx)).to.throw(/not the currently open transaction/i);
        });

        it('should throw when called a second time for the same transaction', () => {
            const manager = new StateManager(createGameState());
            const tx = manager.beginTransaction();
            manager.commit(tx);

            expect(() => manager.commit(tx)).to.throw(/not the currently open transaction/i);
        });
    });

    describe('rollback', () => {
        it('should leave the state returned by getState unchanged', () => {
            const initialState = createGameState();
            const manager = new StateManager(initialState);
            const tx = manager.beginTransaction();
            tx.player.update((player) => (player.currentRoomId = 'room_2'));

            manager.rollback(tx);

            expect(manager.getState()).to.deep.equal(initialState);
        });

        it('should throw when passed a transaction that is not the currently open one', () => {
            const manager = new StateManager(createGameState());
            const foreignTx = new GameTransaction(createGameState());

            expect(() => manager.rollback(foreignTx)).to.throw(/not the currently open transaction/i);
        });
    });
});
