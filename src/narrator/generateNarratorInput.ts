import { GameState, Event, DialogueAction, TransferAction, applyEffects } from '../engine';
import {
    NarratorInput,
    NarrationUnit,
    DialogueNarrationUnit,
    MoveNarrationUnit,
    LookNarrationUnit,
    TransferNarrationUnit,
} from './narrator.input';

export const generateNarratorInput = (state: GameState, events: Event[], playerText: string): NarratorInput => {
    return {
        playerText,
        narrationPlan: generateNarrationUnits(state, events),
    };
};

const generateNarrationUnits = (state: GameState, events: Event[]): NarrationUnit[] => {
    return events.map((event) => {
        switch (event.action.type) {
            case 'move':
                return generateMoveNarrationUnit(state, event);
            case 'dialogue':
                return generateDialogueNarrationUnit(state, event);
            case 'start':
                return generateMoveNarrationUnit(state, event);
            case 'transfer':
                return generateTransferNarrationUnit(state, event);
            case 'look':
                return generateLookNarrationUnit(state, event);
            case 'unknown':
            case 'use_item':
            case 'inventory':
            case 'help':
            case 'quit':
                throw new Error(`Narration unit generation not implemented for action type ${event.action.type}`);
        }
    });
};

const generateDialogueNarrationUnit = (state: GameState, event: Event): DialogueNarrationUnit => {
    const action = event.action as DialogueAction;
    const npc = state.world.npcs[action.data.npcId];
    const isTopicInvocation = action.data.topicId in npc.topics.definitions;
    const isRepeatedTopicInvocation = (npc.topics.state[action.data.topicId]?.invokedCount ?? 0) > 1;
    const visibleTopics = Array.from(npc.topics.visibleTopics).map((topicId) => {
        const definition = npc.topics.definitions[topicId];
        const state = npc.topics.state[topicId] ?? { invokedCount: 0 };
        return {
            id: topicId,
            summary: definition.summary,
            invokedCount: state.invokedCount,
        };
    });

    return {
        narrationContext: {
            actionType: 'dialogue',
            mode: isRepeatedTopicInvocation ? 'topic_repeat' : isTopicInvocation ? 'topic_invocation' : 'freeform',
        },
        data: {
            npc: {
                id: npc.id,
                name: npc.name,
                description: npc.description,
            },
            topics: {
                resolution: isTopicInvocation ? { type: 'matched', topicId: action.data.topicId } : { type: 'none' },
                visible: visibleTopics,
                unlockedThisTurn: [],
            },
        },
        effectsApplied: event.effects?.map(({ type }) => type) ?? [],
    };
};

const generateMoveNarrationUnit = (state: GameState, event: Event): MoveNarrationUnit => {
    const room = state.world.rooms[state.player.currentRoomId];
    const roomInventory = state.world.inventories[room.inventoryId];
    return {
        narrationContext: {
            actionType: 'move',
            mode: 'walk',
        },
        data: {
            result: event.outcome.result === 'success' ? 'success' : 'failure',
            reason: event.outcome.reasons?.[0]?.messageKey,
            locationName: room.name,
            locationDescription: room.description,
            visibleExits: room.exits,
            visibleItems: Object.entries(roomInventory.items).map(([itemId, quantity]) => {
                const item = state.world.items[itemId];
                return {
                    name: item.name,
                    description: item.description,
                    quantity,
                };
            }),
            visibleNpcs: room.npcIds.map((npcId) => {
                const npc = state.world.npcs[npcId];
                return {
                    name: npc.name,
                    description: npc.description,
                };
            }),
        },
        effectsApplied: event.effects?.map(({ type }) => type) ?? [],
    };
};

const generateLookNarrationUnit = (state: GameState, event: Event): LookNarrationUnit => {
    const room = state.world.rooms[state.player.currentRoomId];
    const roomInventory = state.world.inventories[room.inventoryId];
    return {
        narrationContext: {
            actionType: 'look',
            mode: room.lookCount === 1 ? 'initial' : 'repeat',
        },
        data: {
            locationName: room.name,
            locationDescription: room.description,
            visibleExits: room.exits,
            visibleItems: Object.entries(roomInventory.items).map(([itemId, quantity]) => {
                const item = state.world.items[itemId];
                return {
                    name: item.name,
                    description: item.description,
                    quantity,
                };
            }),
            visibleNpcs: room.npcIds.map((npcId) => {
                const npc = state.world.npcs[npcId];
                return {
                    name: npc.name,
                    description: npc.description,
                };
            }),
        },
        effectsApplied: event.effects?.map(({ type }) => type) ?? [],
    };
};

const generateTransferNarrationUnit = (state: GameState, event: Event): TransferNarrationUnit => {
    const action = event.action as TransferAction;
    const isSuccessful = event.outcome.result === 'success';
    const item = state.world.items[action.data.itemId];
    return {
        narrationContext: {
            actionType: 'transfer',
            mode: 'normal',
        },
        data: {
            result: isSuccessful ? 'success' : 'failure',
            reasons: !isSuccessful ? event.outcome.reasons?.map(({ messageKey }) => messageKey) : undefined,
            itemTransferred: {
                name: item.name,
                description: item.description,
                quantity: isSuccessful ? action.data.quantity : 0,
            },
            from: action.data.fromInventoryId,
            to: action.data.toInventoryId,
        },
        effectsApplied: event.effects?.map((effect) => effect.type) ?? [],
    };
};
