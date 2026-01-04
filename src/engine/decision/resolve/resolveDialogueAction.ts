import { GameState } from '../../game.state';
import { DialogueAction } from '../../action';
import { Decision } from '../decision';

export const resolveDialogueAction = (state: GameState, action: DialogueAction): Decision => {
    const { world, player } = state;
    const { npcId, topicId, rawText } = action.data;

    const room = world.rooms[player.currentRoomId];
    if (!room) {
        return { outcome: { result: 'error', reasons: [{ messageKey: `${player.currentRoomId}_not_found` }] } };
    }

    const npc = world.npcs[npcId];
    if (!npc) {
        return { outcome: { result: 'error', reasons: [{ messageKey: `${npcId}_not_found` }] } };
    }

    if (room.npcIds.indexOf(npcId) === -1) {
        return { outcome: { result: 'failure', reasons: [{ messageKey: `${npcId}_not_in_${room.id}` }] } };
    }

    if (!topicId || topicId === 'unknown') {
        return {
            outcome: {
                result: 'success',
            },
            effects: [],
        };
    }

    if (!npc.topics.visibleTopics.has(topicId)) {
        return {
            outcome: {
                result: 'failure',
                reasons: [{ messageKey: `${npcId}_topic_${topicId}_not_visible` }],
            },
            effects: [],
        };
    }

    const topicDefinition = npc.topics.definitions[topicId];
    if (!topicDefinition) {
        return {
            outcome: { result: 'error', reasons: [{ messageKey: `${npcId}_topic_${topicId}_definition_not_found` }] },
        };
    }

    return {
        outcome: { result: 'success' },
        effects: [
            {
                type: 'invoke_topic',
                topicId: topicId,
                npcId: npc.id,
            },
        ],
    };
};
