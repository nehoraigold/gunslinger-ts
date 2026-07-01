import { KeyedValueStore } from './keyed_store';
import { ItemId, ItemState } from '../state/item';

export type ItemsStore = KeyedValueStore<ItemId, ItemState>;
