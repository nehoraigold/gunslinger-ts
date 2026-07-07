import { ItemType } from './ItemType';

export type ItemState = {
    name: string;
    description: string;
    type: ItemType;
    stackable: boolean;
    value: number;
    weight: number;
    takeable: boolean;
    droppable: boolean;
};
