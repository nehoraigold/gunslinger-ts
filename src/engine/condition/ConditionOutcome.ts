import { Condition } from './Condition';

export type ConditionOutcome = { satisfied: true } | { satisfied: false; unmet: Condition[] };

export const satisfied: ConditionOutcome = { satisfied: true };

export const unmetBy = (...conditions: Condition[]): ConditionOutcome => ({ satisfied: false, unmet: conditions });
