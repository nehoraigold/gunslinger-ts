import { z } from 'zod';
import { produce } from 'immer';

import { NpcMoodSchema } from './common/schema';
import { defineAction } from './Action';
import { isAlive } from '../npc';
import { evaluateCondition, evalConditionOpt } from '../condition';

export const TalkToAction = defineAction({
    name: 'talkTo',
    inputSchema: z.object({
        npcId: z.string().describe('The ID of the NPC to talk to'),
        topic: z.string().optional().describe('A specific knowledge topic to ask about'),
    }),
    successDataSchema: z.object({
        npcId: z.string(),
        npcName: z.string(),
        mood: NpcMoodSchema,
        personality: z
            .string()
            .describe(
                'Short descriptor governing the NPC voice and speech patterns. Use this to differentiate how the NPC speaks — a gruff soldier uses short declaratives; a scheming merchant implies rather than states.',
            ),
        isFirstMeeting: z
            .boolean()
            .describe(
                'True if this is the first time the player has spoken to this NPC. Use to calibrate greeting warmth.',
            ),
        nodeAdvanced: z
            .boolean()
            .describe('True if the active dialogue node changed this turn — the NPC story arc has progressed.'),
        currentDialogueNode: z.string().describe('The ID of the currently active dialogue node in the NPC story arc.'),
        availableTopics: z
            .array(z.string())
            .describe(
                'The topics this NPC can discuss right now. This is the ceiling — the NPC cannot reveal knowledge about anything not in this list. Do not invent lore to fill gaps.',
            ),
        activeHints: z
            .array(z.string())
            .describe(
                'Hard behavioural constraints for this conversation. Treat these as rules, not suggestions — "will lie about her name" means generate a false name.',
            ),
        topicContent: z
            .string()
            .optional()
            .describe(
                'The authored content for the requested topic. Deliver this as natural NPC dialogue in the NPC voice — never read it verbatim or expose it as a data field.',
            ),
    }),
    failReasonSchema: z.enum([
        'npc_not_found',
        'npc_not_in_room',
        'npc_dead',
        'in_combat',
        'no_such_topic',
        'topic_not_available',
    ]),
    execute: (state, { npcId, topic }, { fail, succeed }) => {
        const npc = state.world.npcs[npcId];
        if (!npc) return fail('npc_not_found', `No NPC with ID ${npcId}`);

        const room = state.world.rooms[state.player.currentRoomId];
        if (!room.npcIds.includes(npcId)) return fail('npc_not_in_room', `${npc.name} is not here`);

        if (!isAlive(npc)) return fail('npc_dead', `${npc.name} is dead`);

        if (state.combat) return fail('in_combat', 'Cannot talk during combat');

        // Validate topic if given
        let topicContent: string | undefined;
        if (topic !== undefined) {
            const kt = npc.knowledgeTopics.find((t) => t.topic === topic);
            if (!kt) return fail('no_such_topic', `${npc.name} has no knowledge about "${topic}"`);
            if (kt.revealCondition && !evaluateCondition(state, kt.revealCondition)) {
                return fail('topic_not_available', `That topic is not available yet`);
            }
            topicContent = kt.content;
        }

        const isFirstMeeting = npc.firstMetTurn === undefined;

        // Advance to the first node (other than current) whose activationCondition is now met
        const nextNode = Object.values(npc.dialogueNodes).find(
            (node) => node.id !== npc.currentDialogueNode && evalConditionOpt(state, node.activationCondition),
        );
        const nodeAdvanced = nextNode !== undefined;

        const nextState = produce(state, (draft) => {
            const draftNpc = draft.world.npcs[npcId];
            if (isFirstMeeting) draftNpc.firstMetTurn = state.turnCount;
            draftNpc.lastInteractedTurn = state.turnCount;
            if (nodeAdvanced) draftNpc.currentDialogueNode = nextNode!.id;
        });

        const resolvedNpc = nextState.world.npcs[npcId];
        const currentNode = resolvedNpc.dialogueNodes[resolvedNpc.currentDialogueNode];

        const availableTopics = (currentNode.unlocksTopics ?? []).filter((topicId) => {
            const kt = npc.knowledgeTopics.find((t) => t.topic === topicId);
            if (!kt) return false;
            return evalConditionOpt(state, kt.revealCondition);
        });

        const hintSource = currentNode.hintsOverride ?? npc.dialogueHints;
        const activeHints = hintSource.filter((h) => evalConditionOpt(state, h.condition)).map((h) => h.hint);

        return succeed(
            {
                npcId,
                npcName: npc.name,
                mood: npc.mood,
                personality: npc.personality,
                isFirstMeeting,
                nodeAdvanced,
                currentDialogueNode: resolvedNpc.currentDialogueNode,
                availableTopics,
                activeHints,
                topicContent,
            },
            nextState,
        );
    },
});
