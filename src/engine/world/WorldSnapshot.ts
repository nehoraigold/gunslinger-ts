import { Direction } from '../room';
import { EquipSlot } from '../player';
import { HealthProse } from '../combat';
import { QuestSummary } from '../quest';

export interface WorldSnapshot {
    room: {
        id: string;
        name: string;
        exits: Array<{ direction: Direction; destinationName: string; isBlocked: boolean }>;
    };

    npcsPresent: Array<{
        id: string;
        name: string;
        isHostile: boolean;
        healthProse: HealthProse;
        isEngaged: boolean;
    }>;

    itemsPresent: Array<{
        id: string;
        name: string;
        shortDesc: string;
        quantity: number;
    }>;

    playerInventory: Array<{
        id: string;
        name: string;
        isEquipped: boolean;
        slot?: EquipSlot;
        quantity: number;
    }>;

    equippedWeapon: { id: string; name: string } | null;
    equippedArmor: { id: string; name: string } | null;

    playerHealthProse: HealthProse;
    gold: number;

    combat: {
        enemyId: string;
        enemyName: string;
        enemyHealthProse: HealthProse;
        round: number;
        canFlee: boolean;
    } | null;

    activeEffects: Array<{
        name: string;
        description: string;
        turnsRemaining: number;
    }>;

    activeQuests: QuestSummary[];

    // The only tools the LLM is permitted to call this turn.
    // StateManager derives this from current game state.
    availableActions: string[];

    turnCount: number;
}
