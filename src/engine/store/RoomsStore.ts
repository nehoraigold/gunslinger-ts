import { KeyedValueStore } from './keyed_store';
import { RoomId, RoomState } from '../state/room';

export type RoomsStore = KeyedValueStore<RoomId, RoomState>;
