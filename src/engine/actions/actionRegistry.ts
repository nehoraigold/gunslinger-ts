import { Direction } from '../room';
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
        parseCli: (tokens) => ({ direction: inputToDirection(tokens.join(' ')) }),
    },
    lookRoom: {
        action: LookRoomAction,
        aliases: ['look'],
    },
    lookNpc: {
        action: LookNpcAction,
        parseCli: (tokens) => ({ npcId: tokens.join(' ') }),
    },
    lookItem: {
        action: LookItemAction,
        parseCli: (tokens) => ({ itemId: tokens.join(' ') }),
    },
    lookExit: {
        action: LookExitAction,
        parseCli: (tokens) => ({ direction: inputToDirection(tokens.join(' ')) }),
    },
    checkInventory: {
        action: CheckInventoryAction,
        aliases: ['inventory', 'i'],
    },
    checkStatus: {
        action: CheckStatusAction,
    },
    pickUp: {
        action: PickUpAction,
        aliases: ['take'],
        parseCli: (tokens) => ({ itemId: tokens[0], quantity: parseInt(tokens[1] ?? '1') }),
    },
    drop: {
        action: DropAction,
        aliases: ['leave'],
        parseCli: (tokens) => ({ itemId: tokens[0], quantity: parseInt(tokens[1] ?? '1') }),
    },
    equip: {
        action: EquipAction,
        parseCli: (tokens) => ({ itemId: tokens[0] }),
    },
    unequip: {
        action: UnequipAction,
        parseCli: (tokens) => ({ slot: tokens[0] as 'weapon' | 'armor' }),
    },
    useItem: {
        action: UseItemAction,
        aliases: ['use'],
        parseCli: (tokens) => ({ itemId: tokens[0], targetId: tokens[1] || undefined }),
    },
    attack: {
        action: AttackAction,
        parseCli: (tokens) => ({ targetId: tokens.join(' ') }),
    },
    flee: {
        action: FleeAction,
    },
    startCombat: {
        action: StartCombatAction,
        parseCli: (tokens) => ({ targetId: tokens.join(' ') }),
    },
    talkTo: {
        action: TalkToAction,
        aliases: ['talk'],
        parseCli: (tokens) => ({ npcId: tokens[0], topic: tokens[1] }),
    },
    trade: {
        action: TradeAction,
    },
    getFlag: {
        action: GetFlagAction,
    },
    setFlag: {
        action: SetFlagAction,
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
