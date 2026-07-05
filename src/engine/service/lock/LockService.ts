import { Inventory, Lock } from '../../entity';
import { UnlockOutcome } from './UnlockOutcome';

export interface LockService {
    unlock(lock: Lock, keyholder: Inventory): UnlockOutcome;
}
