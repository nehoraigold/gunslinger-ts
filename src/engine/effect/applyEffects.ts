import { GameState } from '../game.state';
import { Effect, MovePlayerEffect, SetExitStateEffect, SetFlagEffect, AddItemEffect, RemoveItemEffect } from './effect';

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
        case 'add_item':
            return applyAddItemEffect(state, effect);
        case 'remove_item':
            return applyRemoveItemEffect(state, effect);
        case 'set_exit_state':
            return applySetExitStateEffect(state, effect);
        case 'set_flag':
            return applySetFlagEffect(state, effect);
        case 'add_npc_to_room':
        case 'remove_npc_from_room':
            throw new Error(`unimplemented effect: ${effect.type}`);
    }
};

const applyMovePlayerEffect = (state: GameState, effect: MovePlayerEffect): GameState => {
    const nextRoom = state.world.rooms[effect.toRoomId];
    return {
        ...state,
        player: {
            ...state.player,
            currentRoomId: nextRoom.id,
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

const applyAddItemEffect = (state: GameState, effect: AddItemEffect): GameState => {
    if (effect.quantity === 0) {
        return state;
    }

    const inventory = state.world.inventories[effect.inventoryId];
    const currentQty = inventory.items[effect.itemId] ?? 0;
    const updatedInventory = {
        ...inventory,
        items: {
            ...inventory.items,
            [effect.itemId]: currentQty + effect.quantity,
        },
    };
    return {
        ...state,
        world: {
            ...state.world,
            inventories: {
                ...state.world.inventories,
                [inventory.id]: updatedInventory,
            },
        },
    };
};

const applyRemoveItemEffect = (state: GameState, effect: RemoveItemEffect): GameState => {
    if (effect.quantity === 0) {
        return state;
    }
    const inventory = state.world.inventories[effect.inventoryId];
    const currentQty = inventory.items[effect.itemId] ?? 0;
    if (currentQty < effect.quantity) {
        throw new Error(
            `Cannot remove ${effect.quantity} items from inventory ${inventory.id} with only ${currentQty} items`,
        );
    }
    const updatedInventory = {
        ...inventory,
        items: {
            ...inventory.items,
            [effect.itemId]: currentQty - effect.quantity,
        },
    };
    if (updatedInventory.items[effect.itemId] === 0) {
        delete updatedInventory.items[effect.itemId];
    }
    return {
        ...state,
        world: {
            ...state.world,
            inventories: {
                ...state.world.inventories,
                [inventory.id]: updatedInventory,
            },
        },
    };
};

const applySetExitStateEffect = (state: GameState, effect: SetExitStateEffect): GameState => {
    const exitState = state.world.exits[effect.exitId];
    return {
        ...state,
        world: {
            ...state.world,
            exits: {
                ...state.world.exits,
                [exitState.id]: {
                    ...exitState,
                    state: {
                        ...exitState.state,
                        [effect.stateKey]: effect.value,
                    },
                },
            },
        },
    };
};

const applySetFlagEffect = (state: GameState, effect: SetFlagEffect): GameState => {
    return {
        ...state,
        world: {
            ...state.world,
            flags: {
                ...state.world.flags,
                [effect.flag]: effect.value,
            },
        },
    };
};
