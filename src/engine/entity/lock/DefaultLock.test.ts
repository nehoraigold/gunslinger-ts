import { describe, it } from 'mocha';
import { expect } from 'chai';

import { DefaultLock } from './DefaultLock';
import { RootValueStore } from '../../store';
import { LockState } from '../../state';

describe(DefaultLock.name, () => {
    function createLock(state?: Partial<LockState>): DefaultLock {
        const store = new RootValueStore<LockState>({
            keyItemId: 'iron_key',
            isLocked: true,
            consumesKey: false,
            ...state,
        });
        return new DefaultLock(store);
    }

    describe('keyItemId', () => {
        it('should return the id of the key that opens the lock', () => {
            const lock = createLock({ keyItemId: 'iron_key' });

            expect(lock.keyItemId).to.equal('iron_key');
        });
    });

    describe('isLocked', () => {
        it('should return true when the lock is locked', () => {
            const lock = createLock({ isLocked: true });

            expect(lock.isLocked()).to.be.true;
        });

        it('should return false when the lock is open', () => {
            const lock = createLock({ isLocked: false });

            expect(lock.isLocked()).to.be.false;
        });
    });

    describe('consumesKey', () => {
        it('should reflect whether opening the lock consumes the key', () => {
            expect(createLock({ consumesKey: true }).consumesKey()).to.be.true;
            expect(createLock({ consumesKey: false }).consumesKey()).to.be.false;
        });
    });

    describe('open', () => {
        it('should unlock the lock', () => {
            const lock = createLock({ isLocked: true });

            lock.open();

            expect(lock.isLocked()).to.be.false;
        });

        it('should leave an already-open lock open', () => {
            const lock = createLock({ isLocked: false });

            lock.open();

            expect(lock.isLocked()).to.be.false;
        });
    });
});
