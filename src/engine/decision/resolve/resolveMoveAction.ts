import { MoveAction } from '../../action';
import { GameState } from '../../index';
import { evaluateCondition } from '../../condition';
import { Decision } from '../decision';

export const resolveMoveAction = (state: GameState, action: MoveAction): Decision => {
    const { player, world } = state;
    const currentRoom = world.rooms[player.currentRoomId];

    if (!currentRoom) {
        return {
            outcome: {
                result: 'error',
                reasons: [{ messageKey: 'current_room_not_found' }],
            },
        };
    }

    const exitId = currentRoom.exits[action.data.direction];
    if (!exitId) {
        return {
            outcome: {
                result: 'failure',
                reasons: [{ messageKey: 'no_exit' }],
            },
        };
    }

    const exitState = world.exits[exitId];
    if (!exitState) {
        return {
            outcome: {
                result: 'error',
                reasons: [{ messageKey: 'exit_not_found' }],
            },
        };
    }

    const isVisible = evaluateCondition(state, exitState.visibility);
    if (!isVisible.ok) {
        return {
            outcome: {
                result: 'failure',
                reasons: isVisible.reasons,
            },
        };
    }

    const isEligible = evaluateCondition(state, exitState.eligibility);
    if (!isEligible.ok) {
        return {
            outcome: {
                result: 'failure',
                reasons: isEligible.reasons,
            },
        };
    }

    const nextRoom = world.rooms[exitState.toRoomId];
    if (!nextRoom) {
        return {
            outcome: {
                result: 'error',
                reasons: [{ messageKey: 'next_room_not_found' }],
            },
        };
    }

    return {
        outcome: {
            result: 'success',
        },
        effects: [
            {
                type: 'move_player',
                toRoomId: exitState.toRoomId,
            },
        ],
    };
};
