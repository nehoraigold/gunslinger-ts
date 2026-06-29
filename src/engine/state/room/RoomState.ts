import { ExitState } from '../exit';

export type RoomState = {
    name: string;
    description: string;
    exits: ExitState[];
};
