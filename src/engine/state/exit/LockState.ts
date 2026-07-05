import { ItemId } from '../item';

export type LockState = {
    keyItemId: ItemId;
    isLocked: boolean;
    consumesKey: boolean;
};
