import { ItemUse } from './itemUse';
import { Condition } from '../../engine';

export type Item = {
    id: string;
    name: string;
    aliases: string[];
    description: string;
    transferable: Condition;
    uses: ItemUse[];
};
