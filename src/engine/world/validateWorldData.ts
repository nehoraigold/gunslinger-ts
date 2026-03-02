import { GameState } from '../state/GameState';

export interface ValidationResult {
    errors: string[];
    warnings: string[];
}

/**
 * Validates world data integrity before the game starts.
 * Errors are fatal (bad cross-references). Warnings are non-fatal (orphaned entities).
 */
export function validateWorldData(state: GameState): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const { world, player } = state;
    const roomIds = new Set(Object.keys(world.rooms));
    const itemIds = new Set(Object.keys(world.items));
    const npcIds = new Set(Object.keys(world.npcs));

    // Track placed IDs for orphan detection
    const placedItemIds = new Set<string>();
    const placedNpcIds = new Set<string>();

    // ── Room cross-references ──────────────────────────────────────────────────
    for (const [roomId, room] of Object.entries(world.rooms)) {
        // Exit targets
        for (const exit of room.exits) {
            if (!roomIds.has(exit.destinationRoomId)) {
                errors.push(
                    `Room "${roomId}": exit "${exit.direction}" targets unknown room "${exit.destinationRoomId}"`,
                );
            }
        }

        // Item references
        for (const itemId of Object.keys(room.items)) {
            if (!itemIds.has(itemId)) {
                errors.push(`Room "${roomId}": references unknown item "${itemId}"`);
            } else {
                placedItemIds.add(itemId);
            }
        }

        // NPC references
        for (const npcId of room.npcIds) {
            if (!npcIds.has(npcId)) {
                errors.push(`Room "${roomId}": references unknown NPC "${npcId}"`);
            } else {
                placedNpcIds.add(npcId);
            }
        }
    }

    // ── Item effect cross-references ───────────────────────────────────────────
    for (const [itemId, item] of Object.entries(world.items)) {
        const effects = [item.useEffect, item.onInspectEffect].filter(Boolean);
        for (const effect of effects) {
            if (effect?.type === 'revealItem' && !itemIds.has(effect.itemId)) {
                errors.push(`Item "${itemId}": revealItem effect references unknown item "${effect.itemId}"`);
            }
        }
    }

    // ── Player state cross-references ──────────────────────────────────────────
    if (!roomIds.has(player.currentRoomId)) {
        errors.push(`Player currentRoomId "${player.currentRoomId}" does not exist in world.rooms`);
    }

    for (const itemId of Object.keys(player.inventory)) {
        if (!itemIds.has(itemId)) {
            errors.push(`Player inventory references unknown item "${itemId}"`);
        } else {
            placedItemIds.add(itemId);
        }
    }

    if (player.equippedWeapon !== null && !itemIds.has(player.equippedWeapon)) {
        errors.push(`Player equippedWeapon "${player.equippedWeapon}" does not exist in world.items`);
    }

    if (player.equippedArmor !== null && !itemIds.has(player.equippedArmor)) {
        errors.push(`Player equippedArmor "${player.equippedArmor}" does not exist in world.items`);
    }

    // ── Orphan detection (warnings only) ──────────────────────────────────────
    for (const itemId of itemIds) {
        if (!placedItemIds.has(itemId)) {
            warnings.push(`Item "${itemId}" is defined but not placed in any room or inventory`);
        }
    }

    for (const npcId of npcIds) {
        if (!placedNpcIds.has(npcId)) {
            warnings.push(`NPC "${npcId}" is defined but not placed in any room`);
        }
    }

    return { errors, warnings };
}
