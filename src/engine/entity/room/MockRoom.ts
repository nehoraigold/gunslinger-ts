import * as sinon from 'sinon';
import { Room } from './Room';

export type MockRoomOptions = Partial<Room>;

const DEFAULT_MOCK_ROOM_OPTIONS: Required<MockRoomOptions> = {
    id: 'room_1',
    getExit: sinon.stub().returns(undefined),
};

export function createMockRoom(options: MockRoomOptions): Room {
    return {
        ...DEFAULT_MOCK_ROOM_OPTIONS,
        ...options,
    };
}
