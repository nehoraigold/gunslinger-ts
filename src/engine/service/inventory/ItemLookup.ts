import { Item } from '../../entity';
import { ItemId } from '../../state';

export interface ItemLookup {
    item(id: ItemId): Item | undefined;
    requireItem(id: ItemId): Item;
}
