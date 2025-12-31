import { GameState } from '../game.state';
import { Action } from '../action';
import { Decision } from './decision';
import { resolveMoveAction, resolveTransferAction, resolveUnknownAction, resolveUseItemAction } from './resolve';

export const decide = (state: GameState, action: Action): Decision => {
    switch (action.type) {
        case 'move':
            return resolveMoveAction(state, action);
        case 'transfer':
            return resolveTransferAction(state, action);
        case 'unknown':
            return resolveUnknownAction(state, action);
        case 'use_item':
            return resolveUseItemAction(state, action);
        case 'look':
        case 'interact':
        case 'inventory':
        case 'start':
        case 'help':
        case 'quit':
            return {
                outcome: { result: 'success' },
                effects: [],
            };
    }
};
