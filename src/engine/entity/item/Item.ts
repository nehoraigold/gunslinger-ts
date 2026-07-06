import { ItemId, ItemType } from '../../state';

export interface Item {
    readonly id: ItemId;
    readonly name: string;
    readonly description: string;
    readonly type: ItemType;
    readonly stackable: boolean;
    readonly value: number;
    readonly weight: number;
    readonly takeable: boolean;
    readonly droppable: boolean;
}
