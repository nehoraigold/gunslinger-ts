import { ItemType } from './ItemType';

export interface ItemSummary {
    id: string;
    name: string;
    shortDesc: string;
    isHidden: boolean;
    type: ItemType;
    interactable: boolean;
}
