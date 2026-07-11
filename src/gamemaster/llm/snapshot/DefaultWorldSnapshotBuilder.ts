import { WorldSnapshotBuilder } from './WorldSnapshotBuilder';
import { GameState, InventoryState, ItemId, NpcId, ExitState, RoomState, ShopState } from '../../../engine/state';
import { DeepReadonly } from '../../../utils/types';

export class DefaultWorldSnapshotBuilder implements WorldSnapshotBuilder {
    build(state: DeepReadonly<GameState>): string {
        return ['=== WORLD STATE ===', ...this.describeLocation(state), ...this.describeInventory(state)].join('\n');
    }

    private describeLocation(state: DeepReadonly<GameState>): string[] {
        const room = state.rooms[state.player.currentRoomId];
        return [
            ...this.describeCurrentRoom(room),
            'EXITS:',
            ...this.describeExits(room.exits),
            'ITEMS HERE:',
            ...this.describeInventoryEntries(state, room.inventory),
            'PEOPLE HERE:',
            ...this.describeNpcs(state, room.npcIds),
        ];
    }

    private describeCurrentRoom(room: DeepReadonly<RoomState>): string[] {
        return [`LOCATION: ${room.name}`, room.description];
    }

    private describeExits(exits: DeepReadonly<ExitState[]>): string[] {
        if (exits.length === 0) {
            return ['  none'];
        }
        return exits.map((exit) =>
            exit.lock?.isLocked ? `  ${exit.direction} (blocked: door_locked)` : `  ${exit.direction}`,
        );
    }

    private describeInventory(state: DeepReadonly<GameState>): string[] {
        return [
            'EQUIPPED:',
            ...this.describeEquippedItems(state),
            'CARRIED:',
            ...this.describeInventoryEntries(state, state.player.inventory),
        ];
    }

    private describeEquippedItems(state: DeepReadonly<GameState>): string[] {
        return [
            `  weapon: ${this.itemName(state, state.player.equipment.weapon)}`,
            `  armor: ${this.itemName(state, state.player.equipment.armor)}`,
        ];
    }

    private describeInventoryEntries(
        state: DeepReadonly<GameState>,
        inventory: DeepReadonly<InventoryState>,
    ): string[] {
        const entries = Object.entries(inventory);
        if (entries.length === 0) {
            return ['  none'];
        }
        return entries.map(([itemId, quantity]) => `  ${this.itemName(state, itemId)} x${quantity} (id: ${itemId})`);
    }

    private itemName(state: DeepReadonly<GameState>, itemId: ItemId | undefined): string {
        if (!itemId) {
            return 'none';
        }
        return state.items[itemId]?.name ?? 'none';
    }

    private describeNpcs(state: DeepReadonly<GameState>, npcIds: DeepReadonly<NpcId[]>): string[] {
        if (npcIds.length === 0) {
            return ['  none'];
        }
        return npcIds.flatMap((npcId) => {
            const npc = state.npcs[npcId];
            const line = `  ${npc?.name ?? 'someone'} (id: ${npcId})`;
            return npc?.shop ? [line, ...this.describeShop(state, npc.shop)] : [line];
        });
    }

    private describeShop(state: DeepReadonly<GameState>, shop: DeepReadonly<ShopState>): string[] {
        const forSale = Object.entries(shop.listings)
            .filter(([itemId, listing]) => listing.forSale && (shop.inventory[itemId] ?? 0) > 0)
            .map(
                ([itemId, listing]) =>
                    `      sells ${this.itemName(state, itemId)} x${shop.inventory[itemId]} @ ${listing.price} (id: ${itemId})`,
            );
        const lines = forSale.length > 0 ? forSale : ['      sells nothing right now'];
        if (shop.buys.length > 0) {
            lines.push(`      buys item types: ${shop.buys.join(', ')}`);
        }
        return lines;
    }
}
