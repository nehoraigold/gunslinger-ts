import { Condition } from '../../engine/condition';
import { Direction } from '../../action';

export interface ExitState {
    id: string;
    type: 'door' | 'inside' | 'outside';
    fromRoomId: string;
    direction: Direction;
    toRoomId: string;
    visibility: Condition;
    eligibility: Condition;
}
