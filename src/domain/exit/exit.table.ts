import { Exit } from './exit';
import { Direction, Condition } from '../../engine';

export type ExitTableEntry = {
    type: string;
    from_room_id: string;
    direction: string;
    to_room_id: string;
    visibility_condition: string;
    eligibility_condition: string;
    state: string | null;
};

const visibilityStringToCondition = (visibility: string): Condition => {
    return JSON.parse(visibility);
};

const eligibilityStringToCondition = (eligibility: string): Condition => {
    return JSON.parse(eligibility);
};

const stateStringToObject = (stateString: string): Exit['state'] => {
    return JSON.parse(stateString);
};

const exitId = (fromRoomId: string, toRoomId: string): string => `${fromRoomId}_to_${toRoomId}`;

export const exitTableEntryToState = (entry: ExitTableEntry): Exit => {
    return {
        id: exitId(entry.from_room_id, entry.to_room_id),
        type: entry.type,
        fromRoomId: entry.from_room_id,
        direction: entry.direction as Direction,
        toRoomId: entry.to_room_id,
        visibility: visibilityStringToCondition(entry.visibility_condition),
        eligibility: eligibilityStringToCondition(entry.eligibility_condition),
        state: entry.state ? stateStringToObject(entry.state) : {},
    };
};
