// A feature that may be conditionally visible based on game state
export interface NotableFeature {
    feature: string;
    condition?: {
        type: 'flag' | 'npc_trust' | 'always';
        key?: string;
        value?: string | boolean | number;
        npcId?: string;
        minScore?: number;
    };
}
