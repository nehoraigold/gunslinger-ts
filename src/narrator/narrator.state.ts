import { Direction } from '../engine/action';
import { Item } from '../domain/item';
import { TopicId } from '../domain/npc';

export type NarratorGameState = {
    player: NarratorPlayerState;
    location: NarratorLocationState;
};

export type NarratorPlayerState = {
    inventory: NarratorItemState[];
};

export type NarratorItemState = Omit<Item, 'id'> & { quantity: number };

export type NarratorTopicState = {
    id: TopicId;
    purpose: string;
    invokedCount: number;
};

export type NarratorLocationState = {
    name: string;
    description: string;
    visibleExits: Partial<Record<Direction, string>>;
    visibleItems: NarratorItemState[];
    visibleNpcs: NarratorNPCState[];
};

export type NarratorNPCState = {
    name: string;
    description: string;
    aliases: string[];
    inventory: NarratorItemState[];
    visibleTopics: NarratorTopicState[];
};
