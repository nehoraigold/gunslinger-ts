import { GameState } from '../game.state';
import { Effect, MovePlayerEffect, SetItemQuantityEffect } from './effect';

export const applyEffects = (state: GameState, effects: Effect[]): GameState => {
    try {
        let nextState = state;
        for (const effect of effects) {
            nextState = applyEffect(nextState, effect);
        }
        return nextState;
    } catch (e) {
        console.error(`Could not apply effects: ${e}`);
        return state;
    }
};

const applyEffect = (state: GameState, effect: Effect): GameState => {
    switch (effect.type) {
        case 'move_player':
            return applyMovePlayerEffect(state, effect);
        case 'set_item_quantity':
            return applySetItemQuantityEffect(state, effect);
        case 'add_npc_to_room':
        case 'remove_npc_from_room':
        case 'set_exit_state':
        case 'set_flag':
            return state;
    }
};

const applyMovePlayerEffect = (state: GameState, effect: MovePlayerEffect): GameState => {
    const nextRoom = state.world.rooms[effect.toRoomId];
    return {
        ...state,
        player: {
            ...state.player,
            currentRoomId: effect.toRoomId,
        },
        world: {
            ...state.world,
            rooms: {
                ...state.world.rooms,
                [nextRoom.id]: {
                    ...nextRoom,
                    visited: true,
                },
            },
        },
    };
};

const applySetItemQuantityEffect = (state: GameState, effect: SetItemQuantityEffect): GameState => {
    const inventory = state.world.inventories[effect.inventoryId];
    return {
        ...state,
        world: {
            ...state.world,
            inventories: {
                ...state.world.inventories,
                [effect.inventoryId]: {
                    ...inventory,
                    items: {
                        ...inventory.items,
                        [effect.itemId]: effect.quantity,
                    },
                },
            },
        },
    };
};
