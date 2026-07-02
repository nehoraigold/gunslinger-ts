import { KeyedValueStore } from './keyed_store';
import { RoomId, RoomState } from '../state';

export type RoomsStore = KeyedValueStore<RoomId, RoomState>;
