import { z } from 'zod';
import { DirectionSchema, ExitSummarySchema, ItemSummarySchema, NpcSummarySchema } from './common/schema';
import { defineActionOutcome } from './ActionOutcome';
import { GameState } from '../../engine/state/GameState';
import { produce } from 'immer';
import { healthValueToProse } from '../../engine/state/utils';

const MoveFailReasonSchema = z.enum(['no_exit', 'exit_is_blocked', 'in_combat']);
export const MoveInputSchema = z.object({
    direction: DirectionSchema.describe('The direction the player wants to move'),
});

export const MoveOutputSchema = defineActionOutcome(
    z.object({
        newRoomId: z.string().describe('The room ID'),
        newRoomName: z.string().describe('The room name'),
        newRoomDescription: z.string().describe('The room description'),
        isFirstVisit: z.boolean().describe('Whether this is the first time the player has visited this room'),
        exits: z.array(ExitSummarySchema).describe('The exits in this room'),
        items: z.array(ItemSummarySchema).describe('The items present in this room'),
        npcs: z.array(NpcSummarySchema).describe('The NPCs present in this room'),
    }),
    MoveFailReasonSchema,
);

export const move = (
    state: GameState,
    { direction }: z.infer<typeof MoveInputSchema>,
): { state?: GameState; outcome: z.infer<typeof MoveOutputSchema> } => {
    const { player, world } = state;
    const currentRoom = world.rooms[player.currentRoomId];

    if (!currentRoom) {
        throw new Error(`Invalid current room id ${player.currentRoomId}`);
    }

    const exit = currentRoom.exits.find((exit) => exit.direction === direction);
    if (!exit) {
        return {
            outcome: {
                result: 'failure',
                reason: 'no_exit',
                message: `There is no exit in direction ${direction}`,
            },
        };
    }

    if (exit.isBlocked) {
        return {
            outcome: {
                result: 'failure',
                reason: 'exit_is_blocked',
                message: exit.blockReason ?? `The exit ${direction} is blocked`,
            },
        };
    }

    const nextRoom = world.rooms[exit.destinationRoomId];
    if (!nextRoom) {
        throw new Error(`Invalid destination room id ${exit.destinationRoomId}`);
    }

    const nextState = produce(state, (draft) => {
        draft.world.rooms[player.currentRoomId].visited = true;
        draft.player.currentRoomId = nextRoom.id;
    });

    return {
        state: nextState,
        outcome: {
            result: 'success',
            data: {
                newRoomId: nextRoom.id,
                newRoomName: nextRoom.name,
                newRoomDescription: nextRoom.description,
                isFirstVisit: !nextRoom.visited,
                exits: nextRoom.exits.map((exit) => ({
                    direction: exit.direction,
                    destinationName: nextState.world.rooms[exit.destinationRoomId].name,
                    hint: exit.hint,
                })),
                items: Object.entries(nextRoom.items).map(([id, qty]) => {
                    const item = nextState.world.items[id];
                    return { ...item, quantity: qty };
                }),
                npcs: nextRoom.npcIds
                    .map((id) => nextState.world.npcs[id])
                    .map((npc) => ({ ...npc, health: healthValueToProse(npc) })),
            },
        },
    };
};
