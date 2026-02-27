export type { Condition } from './Condition';
export { evaluateCondition } from './evaluateCondition';

import { GameState } from '../state/GameState';
import { Condition } from './Condition';
import { evaluateCondition } from './evaluateCondition';

/** Evaluates an optional condition. Returns true when condition is undefined (no gate). */
export const evalConditionOpt = (state: GameState, condition: Condition | undefined): boolean =>
    condition === undefined || evaluateCondition(state, condition);
