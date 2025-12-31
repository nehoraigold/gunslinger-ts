import { ExitState } from './exit.state';
import { Direction } from '../../action';
import { Condition } from '../../engine/condition';

export type ExitTableEntry = {
    from_room_id: string;
    direction: string;
    to_room_id: string;
    visibility_condition: string;
    eligibility_condition: string;
};

const visibilityStringToCondition = (visibility: string): Condition => {
    return JSON.parse(visibility);
};

const eligibilityStringToCondition = (eligibility: string): Condition => {
    return JSON.parse(eligibility);
};

const exitId = (fromRoomId: string, toRoomId: string): string => `${fromRoomId}_to_${toRoomId}`;

export const exitTableEntryToState = (entry: ExitTableEntry): ExitState => {
    return {
        id: exitId(entry.from_room_id, entry.to_room_id),
        fromRoomId: entry.from_room_id,
        direction: entry.direction as Direction,
        toRoomId: entry.to_room_id,
        visibility: visibilityStringToCondition(entry.visibility_condition),
        eligibility: eligibilityStringToCondition(entry.eligibility_condition),
    };
};
