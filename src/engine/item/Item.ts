import { ItemStats } from './ItemStats';
import { ItemSecret } from './ItemSecret';
import { ItemType } from './ItemType';
import { UseEffect } from './UseEffect';
import { Condition } from '../condition/Condition';

export interface Item {
    id: string;
    name: string;
    shortDesc: string; // Used in room listings and inventory
    fullDescription: string; // Used in lookItem() — rich authored prose
    type: ItemType;

    // Present for weapons and armor
    stats?: ItemStats;

    // Effect applied when useItem() is called. Absence means the item is not usable.
    useEffect?: UseEffect;

    // Effect triggered when lookItem() is called (passive inspection).
    // Only 'revealItem' is currently handled; others are reserved for future use.
    onInspectEffect?: UseEffect;

    // Whether to remove one from inventory when used
    consumedOnUse: boolean;

    // In-world hint about usage. Woven into lookItem() narration.
    // Never presented as a menu option. e.g. "The bow is stamped with a crown."
    usageHint?: string;

    // Secrets revealed when conditions are met
    secrets: ItemSecret[];

    // For consumables: how much does this item weigh
    weight: number;

    // Gold value for trading
    value: number;

    // Whether this item can be taken
    takeable: boolean;

    // Whether this item can be dropped
    droppable: boolean;

    // Controls item visibility in the room. Evaluated at lookup time.
    // Use { type: 'true' } for always-visible items.
    // Use { type: 'false' } for permanently hidden items.
    // To permanently reveal a conditionally-hidden item, replace with { type: 'true' }.
    revealCondition: Condition;

    // Metadata for StateManager
    createdAtTurn: number;
    lastInteractedTurn?: number;
}
