export type NarratorInput = {
    playerText: string;
    narrationPlan: NarrationUnit[];
};

export type DialogueNarrationUnit = {
    narrationContext: {
        actionType: 'dialogue';
        mode: 'greeting' | 'topic_invocation' | 'topic_repeat' | 'freeform';
    };
    data: {
        npc: {
            id: string;
            name: string;
            persona?: string;
            description?: string;
        };
        topics: {
            resolution: { type: 'matched'; topicId: string } | { type: 'none' };
            visible: Array<{
                id: string;
                summary: string;
                invokedCount: number;
            }>;
            unlockedThisTurn: string[];
        };
    };
    effectsApplied: string[];
};

export type MoveNarrationUnit = {
    narrationContext: {
        actionType: 'move';
        mode: 'walk';
    };
    data: {
        result: 'success' | 'failure';
        reason?: string;
        locationName?: string;
        locationDescription?: string;

        visibleExits?: Record<string, string>;
        visibleItems?: Array<{
            name: string;
            description: string;
        }>;
        visibleNpcs?: Array<{
            name: string;
            description: string;
        }>;
    };
    effectsApplied: string[];
};

export type LookNarrationUnit = {
    narrationContext: {
        actionType: 'look';
        mode: 'initial' | 'repeat';
    };
    data: {
        locationName?: string;
        locationDescription?: string;

        visibleExits?: Record<string, string>;
        visibleItems?: Array<{
            name: string;
            description: string;
        }>;
        visibleNpcs?: Array<{
            name: string;
            description: string;
        }>;
    };
    effectsApplied: string[];
};

export type InventoryNarrationUnit = {
    narrationContext: {
        actionType: 'inventory';
        mode: 'normal';
    };
    data: {
        items: Array<{
            name: string;
            description: string;
            quantity: number;
        }>;
    };
    effectsApplied: string[];
};

export type TransferNarrationUnit = {
    narrationContext: {
        actionType: 'transfer';
        mode: 'normal';
    };
    data: {
        result: 'success' | 'failure';
        reasons?: string[];
        itemTransferred?: {
            name: string;
            description: string;
            quantity: number;
        };
        from?: string;
        to?: string;
    };
    effectsApplied: string[];
};

export type NarrationUnit =
    | DialogueNarrationUnit
    | MoveNarrationUnit
    | LookNarrationUnit
    | InventoryNarrationUnit
    | TransferNarrationUnit;
