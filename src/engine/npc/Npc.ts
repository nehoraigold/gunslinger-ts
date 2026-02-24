import { NpcMood } from './NpcMood';
import { DialogueNode } from './DialogueNode';
import { KnowledgeTopic } from './KnowledgeTopic';
import { DialogueHint } from './DialogueHint';
import { LootEntry } from './LootEntry';
import { NotableFeature } from './NotableFeature';
import { NpcInventoryItem } from './NpcInventoryItem';

export interface Npc {
    id: string;
    name: string;
    appearance: string; // Physical description. Static authored text.
    personality: string; // LLM voice anchor. e.g. "gruff ex-soldier, distrustful of outsiders"

    // Combat properties
    isHostile: boolean;
    health: number;
    maxHealth: number;
    attackPower: number;
    defense: number;
    agility: number; // Used in flee() probability calculation

    // Dialogue properties
    mood: NpcMood; // Computed from relationshipScore by StateManager
    knowledgeTopics: KnowledgeTopic[];
    dialogueHints: DialogueHint[];
    dialogueNodes: Record<string, DialogueNode>;
    currentDialogueNode: string; // Points to a key in dialogueNodes

    // Commerce
    inventory: NpcInventoryItem[];
    gold: number;

    // Loot table — items dropped on defeat
    lootTable: LootEntry[];

    // Visible equipment described in lookNPC()
    visibleEquipment: string[];

    // Notable features visible on examination
    notableFeatures: NotableFeature[];

    // Whether this NPC can be interacted with
    isAlive: boolean;
    isEngaged: boolean; // Currently in dialogue with player

    // Whether looking at this NPC sets npc_{id}_observed flag
    reactsToObservation: boolean;

    // XP awarded when defeated
    xpValue: number;

    // Metadata
    firstMetTurn?: number;
    lastInteractedTurn?: number;
}
