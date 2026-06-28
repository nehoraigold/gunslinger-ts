import { z } from 'zod';
import { actionRegistry } from '../engine/actions/actionRegistry';
import { LlmTool } from './llm/LlmClient';

const EMPTY_OBJECT_SCHEMA: Record<string, unknown> = { type: 'object', properties: {} };

function toJsonSchema(schema: z.ZodSchema): Record<string, unknown> {
    // z.void() cannot be represented in JSON Schema — substitute an empty object
    if (schema instanceof z.ZodVoid) return EMPTY_OBJECT_SCHEMA;
    return z.toJSONSchema(schema) as Record<string, unknown>;
}

/** Tool invoked by the LLM to present dialogue choices to the player via the TUI modal. */
const PRESENT_DIALOGUE_CHOICES_TOOL: LlmTool = {
    name: 'presentDialogueChoices',
    description:
        'Present a list of dialogue choices to the player and wait for their selection. ' +
        'Use this when an NPC interaction requires the player to choose what to say or do next. ' +
        'Returns the selected choice index and text.',
    inputSchema: {
        type: 'object',
        properties: {
            npcId: {
                type: 'string',
                description: 'The ID of the NPC the player is speaking with.',
            },
            prompt: {
                type: 'string',
                description: "A short prompt shown above the choices (e.g. the NPC's question or statement).",
            },
            choices: {
                type: 'array',
                items: { type: 'string' },
                description: 'The dialogue options the player can choose from (2–4 items).',
                minItems: 2,
                maxItems: 4,
            },
        },
        required: ['npcId', 'prompt', 'choices'],
    },
};

/** Tool invoked by the LLM to open the interactive trade screen for the player. */
const OPEN_TRADE_MENU_TOOL: LlmTool = {
    name: 'openTradeMenu',
    description:
        'Open the interactive trade screen so the player can buy or sell items with an NPC. ' +
        'Call this when the player wants to trade, buy, sell, or barter with an NPC. ' +
        'The player selects items themselves; you receive a transaction summary to narrate. ' +
        'Only call if the NPC is alive, non-hostile, and present in the room.',
    inputSchema: {
        type: 'object',
        properties: {
            npcId: { type: 'string', description: 'The exact ID of the NPC to trade with.' },
        },
        required: ['npcId'],
    },
};

export function buildToolDefinitions(): LlmTool[] {
    const actionTools: LlmTool[] = Object.entries(actionRegistry)
        .filter(([, { llmVisible }]) => llmVisible !== false)
        .map(([name, { action, description }]) => ({
            name,
            description: description ?? name,
            inputSchema: toJsonSchema(action.inputSchema),
        }));

    return [...actionTools, PRESENT_DIALOGUE_CHOICES_TOOL, OPEN_TRADE_MENU_TOOL];
}
