import { FlagValue } from '../state/flags';
import { NpcMood } from '../state/npc';

export type TrueCondition = { type: 'true' };
export type FalseCondition = { type: 'false' };

export type FlagEqCondition = { type: 'flag_eq'; key: string; value: FlagValue };
export type FlagGteCondition = { type: 'flag_gte'; key: string; value: number };
export type FlagLteCondition = { type: 'flag_lte'; key: string; value: number };

export type ItemLocation = 'player' | 'room';
export type QuantityComparison = 'at_least' | 'exactly' | 'at_most';

export type HasItemCondition = {
    type: 'has_item';
    itemId: string;
    location: ItemLocation;
    roomId?: string;
    comparison: QuantityComparison;
    quantity: number;
};

export type LacksItemCondition = {
    type: 'lacks_item';
    itemId: string;
    location: ItemLocation;
    roomId?: string;
};

export type RoomVisitedCondition = { type: 'room_visited'; roomId: string };
export type NpcMoodCondition = { type: 'npc_mood'; npcId: string; mood: NpcMood };
export type NpcAliveCondition = { type: 'npc_alive'; npcId: string };

export type AndCondition = { type: 'and'; conditions: Condition[] };
export type OrCondition = { type: 'or'; conditions: Condition[] };
export type NotCondition = { type: 'not'; condition: Condition };

export type Condition =
    | TrueCondition
    | FalseCondition
    | FlagEqCondition
    | FlagGteCondition
    | FlagLteCondition
    | HasItemCondition
    | LacksItemCondition
    | RoomVisitedCondition
    | NpcMoodCondition
    | NpcAliveCondition
    | AndCondition
    | OrCondition
    | NotCondition;
