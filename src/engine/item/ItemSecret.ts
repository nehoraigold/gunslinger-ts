import { FlagValue } from '../flag';

export interface ItemSecret {
    content: string;
    condition: ItemSecretCondition;
}

export type ItemSecretCondition =
    | { type: 'flag'; key: string; value: FlagValue }
    | { type: 'item_examined'; itemId: string }
    | { type: 'npc_trust'; npcId: string; minScore: number };
