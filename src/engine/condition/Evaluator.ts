import { Context } from '../context';
import { Condition } from './Condition';

export type Evaluator<C extends Condition = Condition> = (ctx: Context, condition: C) => boolean;
