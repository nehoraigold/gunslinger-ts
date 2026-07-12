import { ItemType } from './ItemType';
import { ItemEffect } from '../../effect/ItemEffect';

export type ItemState = {
    name: string;
    description: string;
    type: ItemType;
    stackable: boolean;
    value: number;
    weight: number;
    takeable: boolean;
    droppable: boolean;
    useEffect?: ItemEffect;
    consumedOnUse: boolean;
};
