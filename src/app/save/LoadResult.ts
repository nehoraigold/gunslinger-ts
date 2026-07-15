import { RoomId } from '../../engine/state';

export type LoadResult = { status: 'loaded'; roomId: RoomId } | { status: 'not_found' };
