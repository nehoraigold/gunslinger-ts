import { ItemType } from './ItemType';

export type ItemState = {
    name: string;
    description: string;
    type: ItemType;
    stackable: boolean;
};
