import { Condition } from './Condition';

export type ConditionOutcome = { satisfied: true } | { satisfied: false; unmet: Condition[] };

export const ConditionOutcome = {
    satisfied: (): ConditionOutcome => ({ satisfied: true }),
    unmetBy: (...conditions: Condition[]): ConditionOutcome => ({ satisfied: false, unmet: conditions }),
};
