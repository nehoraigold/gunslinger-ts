export type TopicId = string;

export type TopicDefinition = {
    purpose: string;
    unlocks: TopicId[];
};

export type TopicState = {
    invokedCount: number;
};
