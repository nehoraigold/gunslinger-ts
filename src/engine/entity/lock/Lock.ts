import { ItemId } from '../../state';

export interface Lock {
    readonly keyItemId: ItemId;
    isLocked(): boolean;
    consumesKey(): boolean;
    open(): void;
}
