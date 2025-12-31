import { Condition, Effect } from '../../engine';

export type ItemUse = {
    verb: string;
    aliases: string[];
    condition: Condition;
    effects: Effect[];
};
