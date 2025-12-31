type TrueCondition = { type: 'true' };
type FalseCondition = { type: 'false' };

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
    value: boolean;
};

export type AndCondition = {
    type: 'and';
    conditions: Condition[];
};

export type OrCondition = {
    type: 'or';
    conditions: Condition[];
};

export type Condition =
    | AndCondition
    | OrCondition
    | HasItemCondition
    | LacksItemCondition
    | FlagCondition
    | TrueCondition
    | FalseCondition;
