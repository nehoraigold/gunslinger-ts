import { StateManager } from '../engine/state/StateManager';
import { GameStorage } from '../engine/meta/GameStorage';
import { ConversationManager } from '../agent/ConversationManager';
import { BlessedKey } from '../ui/screen';
import { UIModals } from '../ui';
import { Sidebar } from '../ui/Sidebar';

export type { BlessedKey };

export interface KeySpec {
    name: string;
    ctrl?: boolean;
    meta?: boolean;
}

export interface ShortcutContext {
    block(): void;
    unblock(): void;
    resolveWith(value: string): void;
    stateManager: StateManager;
    conversationManager: ConversationManager;
    storage: GameStorage;
    narrate: (prompt: string) => Promise<void>;
    modals: UIModals;
    sidebar: Sidebar;
    setPreviousRoomId(id: string | null): void;
}

type ShortcutHandler = (ctx: ShortcutContext) => void | Promise<void>;

interface ShortcutEntry {
    description: string;
    handler: ShortcutHandler;
    requiresEmptyBuffer: boolean;
}

function keyId(k: KeySpec | BlessedKey): string {
    return [k.ctrl ? 'ctrl' : '', k.meta ? 'meta' : '', k.name].filter(Boolean).join('+');
}

export class ShortcutRegistry {
    private readonly entries = new Map<string, ShortcutEntry>();

    register(key: KeySpec, description: string, handler: ShortcutHandler, requiresEmptyBuffer = true): void {
        this.entries.set(keyId(key), { description, handler, requiresEmptyBuffer });
    }

    dispatch(ch: string | null, key: BlessedKey, bufferLength: number, ctx: ShortcutContext): boolean {
        const entry = this.entries.get(keyId(key));
        if (!entry) return false;
        if (entry.requiresEmptyBuffer && bufferLength > 0) return false;
        void entry.handler(ctx);
        return true;
    }
}
