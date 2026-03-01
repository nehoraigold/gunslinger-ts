import { z } from 'zod';
import { Direction } from '../room';
import { GameState } from '../state/GameState';
import { Action } from './Action';
import { AttackAction } from './attack';
import { CheckInventoryAction } from './checkInventory';
import { CheckStatusAction } from './checkStatus';
import { DropAction } from './drop';
import { EquipAction } from './equip';
import { FleeAction } from './flee';
import { GetFlagAction } from './getFlag';
import { LookExitAction } from './lookExit';
import { LookItemAction } from './lookItem';
import { LookNpcAction } from './lookNpc';
import { LookRoomAction } from './lookRoom';
import { MoveAction } from './move';
import { PickUpAction } from './pickUp';
import { SetFlagAction } from './setFlag';
import { StartCombatAction } from './startCombat';
import { TalkToAction } from './talkTo';
import { TradeAction } from './trade';
import { UnequipAction } from './unequip';
import { UseItemAction } from './useItem';

type RegistryEntry = {
    action: Action<any, any>;
    /** Short description of when the LLM should call this action. */
    description?: string;
    /** Additional CLI command names that resolve to this action. */
    aliases?: readonly string[];
    /** Parse raw CLI tokens into action input. Omit for z.void() actions (passes undefined). */
    parseCli?: (tokens: string[]) => unknown;
};

const inputToDirection = (input: string): Direction => {
    switch (input) {
        case 'n':
            return 'north';
        case 'e':
            return 'east';
        case 'w':
            return 'west';
        case 's':
            return 'south';
        case 'u':
            return 'up';
        case 'd':
            return 'down';
        default:
            return input as Direction;
    }
};

export const actionRegistry: Record<string, RegistryEntry> = {
    move: {
        action: MoveAction,
        description: 'Call when the player expresses intent to travel in any direction or enter a named location.',
        parseCli: (tokens) => ({ direction: inputToDirection(tokens.join(' ')) }),
    },
    lookRoom: {
        action: LookRoomAction,
        description: 'Call when the player says "look", "look around", or examines the current room.',
        aliases: ['look'],
    },
    lookNpc: {
        action: LookNpcAction,
        description: 'Call when the player examines, studies, or looks closely at a specific NPC.',
        parseCli: (tokens) => ({ npcId: tokens.join(' ') }),
    },
    lookItem: {
        action: LookItemAction,
        description: 'Call when the player examines, inspects, reads, or studies a specific item.',
        parseCli: (tokens) => ({ itemId: tokens.join(' ') }),
    },
    lookExit: {
        action: LookExitAction,
        description: 'Call when the player inspects a specific exit or passage to learn more about it.',
        parseCli: (tokens) => ({ direction: inputToDirection(tokens.join(' ')) }),
    },
    checkInventory: {
        action: CheckInventoryAction,
        description: "Call when the player checks their inventory, asks what they're carrying, or reviews their items.",
        aliases: ['inventory', 'i'],
    },
    checkStatus: {
        action: CheckStatusAction,
        description: 'Call when the player checks their health, stats, or overall condition.',
    },
    pickUp: {
        action: PickUpAction,
        description: 'Call when the player picks up, takes, or grabs an item from the current room.',
        aliases: ['take'],
        parseCli: (tokens) => ({ itemId: tokens[0], quantity: parseInt(tokens[1] ?? '1') }),
    },
    drop: {
        action: DropAction,
        description: 'Call when the player drops, discards, or leaves behind an item from their inventory.',
        aliases: ['leave'],
        parseCli: (tokens) => ({ itemId: tokens[0], quantity: parseInt(tokens[1] ?? '1') }),
    },
    equip: {
        action: EquipAction,
        description: 'Call when the player equips, wields, or puts on a weapon or piece of armor.',
        parseCli: (tokens) => ({ itemId: tokens[0] }),
    },
    unequip: {
        action: UnequipAction,
        description: 'Call when the player removes, sheathes, or takes off equipped gear.',
        parseCli: (tokens) => ({ slot: tokens[0] as 'weapon' | 'armor' }),
    },
    useItem: {
        action: UseItemAction,
        description: 'Call when the player uses, activates, drinks, or applies an item — optionally on a target.',
        aliases: ['use'],
        parseCli: (tokens) => ({ itemId: tokens[0], targetId: tokens[1] || undefined }),
    },
    attack: {
        action: AttackAction,
        description:
            'Call each combat round when the player attacks the current enemy. Only valid during active combat.',
        parseCli: (tokens) => ({ targetId: tokens.join(' ') }),
    },
    flee: {
        action: FleeAction,
        description: 'Call when the player attempts to escape from active combat.',
    },
    startCombat: {
        action: StartCombatAction,
        description:
            'Call when the player initiates an attack on a non-hostile NPC or hostile creature to start combat.',
        parseCli: (tokens) => ({ targetId: tokens.join(' ') }),
    },
    talkTo: {
        action: TalkToAction,
        description: 'Call when the player speaks to, addresses, or initiates conversation with an NPC.',
        aliases: ['talk'],
        parseCli: (tokens) => ({ npcId: tokens[0], topic: tokens[1] }),
    },
    trade: {
        action: TradeAction,
        description: 'Call when the player offers to buy, sell, or trade items with an NPC.',
    },
    getFlag: {
        action: GetFlagAction,
        description: 'Call to read a named game flag value. Use to check quest or world state before narrating.',
    },
    setFlag: {
        action: SetFlagAction,
        description: 'Call to set a named game flag. Use to record player choices or world-state changes.',
    },
};

// ── Alias resolution ──────────────────────────────────────────────────────────

const aliasMap = new Map<string, string>();
for (const [name, entry] of Object.entries(actionRegistry)) {
    aliasMap.set(name, name);
    for (const alias of entry.aliases ?? []) {
        aliasMap.set(alias, name);
    }
}

/** Resolves a CLI command (canonical name or alias) to a canonical action name. */
export const resolveActionName = (cmd: string): string | undefined => aliasMap.get(cmd);

// ── LLM dispatch ─────────────────────────────────────────────────────────────

/**
 * Execute an action by canonical name with already-parsed input (from LLM tool call).
 * Validates input through the action's Zod schema before executing.
 * Throws if the action name is not found or input is invalid.
 */
export function executeActionByName(
    state: GameState,
    name: string,
    input: unknown,
): { state?: GameState; outcome: unknown } {
    const entry = actionRegistry[name];
    if (!entry) throw new Error(`Unknown action: ${name}`);
    // For z.void() actions, always pass undefined — LLMs sometimes send stray data for no-arg tools.
    const normalized =
        entry.action.inputSchema instanceof z.ZodVoid
            ? undefined
            : input !== null && typeof input === 'object' && Object.keys(input as object).length === 0
              ? undefined
              : input;
    const parsedInput = entry.action.inputSchema.parse(normalized);
    return entry.action.execute(state, parsedInput);
}
