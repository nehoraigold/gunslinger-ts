export type NarratorInput = {
    playerText: string;
    narrationPlan: NarrationUnit[];
};

export type NarrationUnit = {
    context: NarrationContext;
    effectsApplied: string[];
};

export type DialogueNarrationContext = {
    actionType: 'dialogue';
    mode: 'greeting' | 'topic_invocation' | 'topic_repeat' | 'freeform';
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
};

export type MoveNarrationContext = {
    actionType: 'move';
    mode: 'walk';
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
};

export type LookNarrationContext = {
    actionType: 'look';
    mode: 'initial' | 'repeat';
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
};

export type InventoryNarrationContext = {
    actionType: 'inventory';
    mode: 'normal';
    data: {
        items: Array<{
            name: string;
            description: string;
            quantity: number;
        }>;
    };
};

export type TransferNarrationContext = {
    actionType: 'transfer';
    mode: 'normal';
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
};

export type NarrationContext =
    | DialogueNarrationContext
    | MoveNarrationContext
    | LookNarrationContext
    | InventoryNarrationContext
    | TransferNarrationContext;
