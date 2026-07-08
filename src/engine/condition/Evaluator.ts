import { Context } from '../context';
import { Condition } from './Condition';
import { ConditionOutcome } from './ConditionOutcome';

export type Evaluator<C extends Condition = Condition> = (ctx: Context, condition: C) => ConditionOutcome;
