import { Inventory, Lock } from '../../entity';
import { LockService } from './LockService';
import { UnlockOutcome } from './UnlockOutcome';

export class DefaultLockService implements LockService {
    unlock(lock: Lock, keyholder: Inventory): UnlockOutcome {
        if (!lock.isLocked()) {
            return { type: 'alreadyUnlocked' };
        }
        if (!keyholder.has(lock.keyItemId)) {
            return { type: 'missingKey' };
        }

        lock.open();
        if (lock.consumesKey()) {
            keyholder.remove(lock.keyItemId);
        }
        return { type: 'unlocked' };
    }
}
