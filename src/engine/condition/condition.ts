import { ExitState } from '../../domain/exit';

export type TrueCondition = { type: 'true' };
export type FalseCondition = { type: 'false' };

export type HasItemCondition = {
    type: 'has_item';
    inventoryId: string;
    itemId: string;
    comparison: 'at_least' | 'exactly' | 'at_most';
    quantity: number;
};

export type LacksItemCondition = {
    type: 'lacks_item';
    inventoryId: string;
    itemId: string;
};

export type FlagCondition = {
    type: 'flag';
    flag: string;
    expectedValue: boolean;
};

export type AndCondition = {
    type: 'and';
    conditions: Condition[];
};

export type OrCondition = {
    type: 'or';
    conditions: Condition[];
};

export type ExitStateCondition = {
    type: 'exit_state';
    exitId: string;
    stateKey: keyof ExitState['state'];
    expectedValue: unknown;
};

export type Condition =
    | AndCondition
    | OrCondition
    | HasItemCondition
    | LacksItemCondition
    | ExitStateCondition
    | FlagCondition
    | TrueCondition
    | FalseCondition;
