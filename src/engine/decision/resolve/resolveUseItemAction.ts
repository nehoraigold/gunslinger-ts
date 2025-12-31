import { GameState } from '../../game.state';
import { UseItemAction } from '../../action';
import { Decision } from '../decision';

export const resolveUseItemAction = (state: GameState, action: UseItemAction): Decision => {
    return { outcome: { result: 'error', reasons: [{ messageKey: 'unimplemented' }] } };
};
