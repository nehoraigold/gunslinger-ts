import { Condition } from '../../engine/condition';
import { Direction } from '../../action';

export type ExitState = {
    id: string;
    type: string;
    fromRoomId: string;
    direction: Direction;
    toRoomId: string;
    visibility: Condition;
    eligibility: Condition;
    state: Record<string, unknown>;
};
