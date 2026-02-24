import { FlagValue } from '../flag';

export type ObjectiveCondition =
    | { type: 'flag'; key: string; value: FlagValue }
    | { type: 'item_in_inventory'; itemId: string }
    | { type: 'npc_defeated'; npcId: string }
    | { type: 'room_visited'; roomId: string }
    | { type: 'manual' }; // Set complete via setFlag — no auto-detection
