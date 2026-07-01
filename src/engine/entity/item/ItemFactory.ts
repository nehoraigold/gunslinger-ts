import { Item } from './Item';
import { ItemId } from '../../state/item';
import { ItemStore } from '../../store';

export interface ItemFactory {
    create(id: ItemId, store: ItemStore): Item;
}
