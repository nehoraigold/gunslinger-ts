import { Direction, Condition } from '../../engine';

export type Exit = {
    id: string;
    type: string;
    fromRoomId: string;
    direction: Direction;
    toRoomId: string;
    visibility: Condition;
    eligibility: Condition;
    state: Record<string, unknown>;
};
