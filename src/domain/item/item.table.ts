import { Item } from './item';

export type ItemTableEntry = {
    id: string;
    name: string;
    description: string;
    aliases: string;
    uses: string | null;
    transferable: string | null;
    interactions: string | null;
    value: number | null;
};

export const itemTableEntryToState = (entry: ItemTableEntry): Item => {
    return {
        id: entry.id,
        name: entry.name,
        description: entry.description,
        aliases: entry.aliases?.split(';') ?? [],
        uses: entry.uses ? JSON.parse(entry.uses) : [],
        transferable: entry.transferable ? JSON.parse(entry.transferable) : { type: 'true' },
    };
};
