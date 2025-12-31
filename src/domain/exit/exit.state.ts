import { Condition } from '../../engine/condition';
import { Direction } from '../../action';

export interface ExitState {
    id: string;
    fromRoomId: string;
    direction: Direction;
    toRoomId: string;
    visibility: Condition;
    eligibility: Condition;
}
