import { EntityStore } from './EntityStore';
import { RoomId, RoomState } from '../state/room';

export type RoomStore = EntityStore<RoomId, RoomState>;
