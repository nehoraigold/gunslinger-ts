import { ItemState } from './item.state';

export type ItemTableEntry = {
    id: string;
    name: string;
    description: string;
    aliases: string;
    transferable: boolean;
    interactions: string | null;
    value: number | null;
};

export const itemTableEntryToState = (entry: ItemTableEntry): ItemState => {
    return {
        id: entry.id,
        name: entry.name,
        description: entry.description,
        aliases: entry.aliases?.split(';') ?? [],
    };
};
