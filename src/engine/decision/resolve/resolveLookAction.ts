import { GameState } from '../../game.state';
import { LookAction } from '../../action';
import { Decision } from '../decision';

export const resolveLookAction = (state: GameState, _action: LookAction): Decision => {
    const roomId = state.player.currentRoomId;
    return { outcome: { result: 'success' }, effects: [{ type: 'look', roomId }] };
};
