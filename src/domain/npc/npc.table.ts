import { Npc } from './npc';

export type NPCTableEntry = {
    id: string;
    name: string;
    description: string;
    aliases: string;
    inventory_id: string;
    topic_definitions: string | null;
    visible_topics: string | null;
};

export const npcTableEntryToState = (entry: NPCTableEntry): Npc => {
    return {
        id: entry.id,
        name: entry.name,
        aliases: entry.aliases?.split(';'),
        description: entry.description,
        inventoryId: entry.inventory_id,
        topics: {
            definitions: entry.topic_definitions ? JSON.parse(entry.topic_definitions) : {},
            state: {},
            visibleTopics: new Set(entry.visible_topics ? entry.visible_topics.split(';') : []),
        },
    };
};
