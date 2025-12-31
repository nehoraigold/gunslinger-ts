import { Condition } from './condition';
import { Reason } from '../reason';

export type ConditionResultReason = Reason & {
    condition: Condition;
};
