import { TopicDefinition, TopicId, TopicState } from './topic';

export type Npc = {
    id: string;
    name: string;
    aliases: string[];
    description: string;
    inventoryId: string;
    topics: {
        definitions: Record<TopicId, TopicDefinition>;
        state: Record<TopicId, TopicState>;
        visibleTopics: Set<TopicId>;
    };
};
