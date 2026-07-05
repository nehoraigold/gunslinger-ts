import { describe, it } from 'mocha';
import { expect } from 'chai';

import { DefaultLockService } from './DefaultLockService';
import { DefaultInventory, DefaultLock } from '../../entity';
import { RootValueStore } from '../../store';
import { InventoryState, LockState } from '../../state';

describe(DefaultLockService.name, () => {
    function createLock(state?: Partial<LockState>): DefaultLock {
        return new DefaultLock(
            new RootValueStore<LockState>({
                keyItemId: 'iron_key',
                isLocked: true,
                consumesKey: false,
                ...state,
            }),
        );
    }

    function createInventory(state?: InventoryState): DefaultInventory {
        return new DefaultInventory(new RootValueStore<InventoryState>(state ?? {}));
    }

    describe('unlock', () => {
        it('should open the lock when the keyholder has the matching key', () => {
            const service = new DefaultLockService();
            const lock = createLock({ isLocked: true });
            const keyholder = createInventory({ iron_key: 1 });

            const outcome = service.unlock(lock, keyholder);

            expect(outcome).to.deep.equal({ type: 'unlocked' });
            expect(lock.isLocked()).to.be.false;
        });

        it('should not consume the key when the lock does not consume it', () => {
            const service = new DefaultLockService();
            const lock = createLock({ isLocked: true, consumesKey: false });
            const keyholder = createInventory({ iron_key: 1 });

            service.unlock(lock, keyholder);

            expect(keyholder.quantityOf('iron_key')).to.equal(1);
        });

        it('should consume the key when the lock consumes it', () => {
            const service = new DefaultLockService();
            const lock = createLock({ isLocked: true, consumesKey: true });
            const keyholder = createInventory({ iron_key: 1 });

            service.unlock(lock, keyholder);

            expect(keyholder.quantityOf('iron_key')).to.equal(0);
        });

        it('should return missingKey and leave the lock locked when the keyholder lacks the key', () => {
            const service = new DefaultLockService();
            const lock = createLock({ isLocked: true });
            const keyholder = createInventory();

            const outcome = service.unlock(lock, keyholder);

            expect(outcome).to.deep.equal({ type: 'missingKey' });
            expect(lock.isLocked()).to.be.true;
        });

        it('should return alreadyUnlocked when the lock is already open', () => {
            const service = new DefaultLockService();
            const lock = createLock({ isLocked: false });
            const keyholder = createInventory({ iron_key: 1 });

            const outcome = service.unlock(lock, keyholder);

            expect(outcome).to.deep.equal({ type: 'alreadyUnlocked' });
        });

        it('should not consume the key when the lock is already open', () => {
            const service = new DefaultLockService();
            const lock = createLock({ isLocked: false, consumesKey: true });
            const keyholder = createInventory({ iron_key: 1 });

            service.unlock(lock, keyholder);

            expect(keyholder.quantityOf('iron_key')).to.equal(1);
        });
    });
});
