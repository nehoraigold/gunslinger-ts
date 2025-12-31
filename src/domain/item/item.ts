import { ItemUse } from './itemUse';

export type Item = {
    id: string;
    name: string;
    aliases: string[];
    description: string;
    uses: ItemUse[];
};
