export type TopicId = string;

export type TopicDefinition = {
    summary: string;
    unlocks: TopicId[];
};

export type TopicState = {
    invokedCount: number;
};
