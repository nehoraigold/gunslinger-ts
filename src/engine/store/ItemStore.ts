import { EntityStore } from './EntityStore';
import { ItemId, ItemState } from '../state/item';

export type ItemStore = EntityStore<ItemId, ItemState>;
