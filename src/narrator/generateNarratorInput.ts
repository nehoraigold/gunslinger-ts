import { GameState, Event, DialogueAction, TransferAction } from '../engine';
import {
    NarratorInput,
    NarrationUnit,
    DialogueNarrationContext,
    NarrationContext,
    MoveNarrationContext,
    TransferNarrationContext,
    LookNarrationContext,
} from './narrator.input';

export const generateNarratorInput = (state: GameState, events: Event[], playerText: string): NarratorInput => {
    return {
        playerText,
        narrationPlan: generateNarrationUnits(state, events),
    };
};

const generateNarrationUnits = (state: GameState, events: Event[]): NarrationUnit[] => {
    return events.map((event) => {
        const context = generateNarrationContext(state, event);
        const effectsApplied = event.effects?.map(({ type }) => type) ?? [];
        return { context, effectsApplied };
    });
};

const generateNarrationContext = (state: GameState, event: Event): NarrationContext => {
    switch (event.action.type) {
        case 'move':
            return generateMoveNarrationContext(state, event);
        case 'dialogue':
            return generateDialogueNarrationContext(state, event);
        case 'transfer':
            return generateTransferNarrationContext(state, event);
        case 'start':
        case 'look':
            return generateLookNarrationContext(state, event);
        case 'use_item':
        case 'unknown':
        case 'inventory':
        case 'help':
        case 'quit':
            throw new Error(`Narration unit generation not implemented for action type ${event.action.type}`);
    }
};

const generateDialogueNarrationContext = (state: GameState, event: Event): DialogueNarrationContext => {
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
        actionType: 'dialogue',
        mode: isRepeatedTopicInvocation ? 'topic_repeat' : isTopicInvocation ? 'topic_invocation' : 'freeform',
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
    };
};

const generateMoveNarrationContext = (state: GameState, event: Event): MoveNarrationContext => {
    const room = state.world.rooms[state.player.currentRoomId];
    const roomInventory = state.world.inventories[room.inventoryId];
    return {
        actionType: 'move',
        mode: 'walk',
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
    };
};

const generateLookNarrationContext = (state: GameState, event: Event): LookNarrationContext => {
    const room = state.world.rooms[state.player.currentRoomId];
    const roomInventory = state.world.inventories[room.inventoryId];
    return {
        actionType: 'look',
        mode: room.lookCount <= 1 ? 'initial' : 'repeat',
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
    };
};

const generateTransferNarrationContext = (state: GameState, event: Event): TransferNarrationContext => {
    const action = event.action as TransferAction;
    const isSuccessful = event.outcome.result === 'success';
    const item = state.world.items[action.data.itemId];
    return {
        actionType: 'transfer',
        mode: 'normal',
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
    };
};
