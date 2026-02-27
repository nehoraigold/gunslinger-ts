import { ItemType } from './ItemType';
import { UseEffect } from './UseEffect';

export interface ItemSummary {
    id: string;
    name: string;
    shortDesc: string;
    type: ItemType;
    useEffect?: UseEffect;
}
