import { GameState } from '../game.state';
import {
    AddItemEffect,
    Effect,
    InvokeTopicEffect,
    LookEffect,
    MovePlayerEffect,
    RemoveItemEffect,
    SetExitStateEffect,
    SetFlagEffect,
} from './effect';
import { TopicState } from '../../domain/npc';

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
        case 'invoke_topic':
            return applyInvokeTopicEffect(state, effect);
        case 'look':
            return applyLookEffect(state, effect);
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
                    visitedCount: nextRoom.visitedCount + 1,
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

const applyInvokeTopicEffect = (state: GameState, effect: InvokeTopicEffect): GameState => {
    const npc = state.world.npcs[effect.npcId];
    if (!npc) {
        throw new Error(`Cannot invoke topic for unknown npc ${effect.npcId}`);
    }

    const topicDefinition = npc.topics.definitions[effect.topicId];
    if (!topicDefinition) {
        throw new Error(`Cannot invoke unknown topic ${effect.topicId} for npc ${effect.npcId}`);
    }

    const topicState: TopicState = Object.assign({ invokedCount: 0 }, npc.topics.state[effect.topicId]);
    topicState.invokedCount++;

    const visibleTopicIds = new Set(npc.topics.visibleTopics);
    topicDefinition.unlocks.forEach((unlock) => visibleTopicIds.add(unlock));

    return {
        ...state,
        world: {
            ...state.world,
            npcs: {
                ...state.world.npcs,
                [npc.id]: {
                    ...npc,
                    topics: {
                        ...npc.topics,
                        state: {
                            ...npc.topics.state,
                            [effect.topicId]: topicState,
                        },
                        visibleTopics: visibleTopicIds,
                    },
                },
            },
        },
    };
};

const applyLookEffect = (state: GameState, effect: LookEffect): GameState => {
    const room = state.world.rooms[effect.roomId];
    return {
        ...state,
        world: {
            ...state.world,
            rooms: {
                ...state.world.rooms,
                [room.id]: {
                    ...room,
                    lookCount: room.lookCount + 1,
                },
            },
        },
    };
};
