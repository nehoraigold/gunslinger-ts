import { ItemStats } from './ItemStats';
import { ItemSecret } from './ItemSecret';
import { ItemType } from './ItemType';

export interface Item {
    id: string;
    name: string;
    shortDesc: string; // Used in room listings and inventory
    fullDescription: string; // Used in lookItem() — rich authored prose
    type: ItemType;

    // Present for weapons and armor
    stats?: ItemStats;

    // Whether useItem() will do something meaningful with this item
    interactable: boolean;

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

    // Whether this item is currently visible in the room.
    // Hidden items do not appear in lookRoom() output.
    isHidden: boolean;

    // Metadata for StateManager
    createdAtTurn: number;
    lastInteractedTurn?: number;
}
