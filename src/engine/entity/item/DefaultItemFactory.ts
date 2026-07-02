import { ItemFactory } from './ItemFactory';
import { ItemId } from '../../state';
import { ItemStore } from '../../store';
import { Item } from './Item';

export class DefaultItemFactory implements ItemFactory {
    create(id: ItemId, store: ItemStore): Item {
        return {};
    }
}
