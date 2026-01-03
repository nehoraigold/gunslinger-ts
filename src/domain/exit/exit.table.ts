import { Exit } from './exit';
import { Direction, Condition } from '../../engine';

export type ExitTableEntry = {
    type: string;
    from_room_id: string;
    direction: string;
    to_room_id: string;
    visibility_condition: string | null;
    eligibility_condition: string | null;
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
        visibility: entry.visibility_condition
            ? visibilityStringToCondition(entry.visibility_condition)
            : { type: 'true' },
        eligibility: entry.eligibility_condition
            ? eligibilityStringToCondition(entry.eligibility_condition)
            : { type: 'true' },
        state: entry.state ? stateStringToObject(entry.state) : {},
    };
};
