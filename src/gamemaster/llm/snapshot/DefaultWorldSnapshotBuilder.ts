import { WorldSnapshotBuilder } from './WorldSnapshotBuilder';
import { GameState, ItemId, ExitState, RoomState } from '../../../engine/state';
import { DeepReadonly } from '../../../utils/types';

export class DefaultWorldSnapshotBuilder implements WorldSnapshotBuilder {
    build(state: DeepReadonly<GameState>): string {
        return ['=== WORLD STATE ===', ...this.describeLocation(state), ...this.describeInventory(state)].join('\n');
    }

    private describeLocation(state: DeepReadonly<GameState>): string[] {
        const room = state.rooms[state.player.currentRoomId];
        return [...this.describeCurrentRoom(room), 'EXITS:', ...this.describeExits(room.exits)];
    }

    private describeCurrentRoom(room: DeepReadonly<RoomState>): string[] {
        return [`LOCATION: ${room.name}`, room.description];
    }

    private describeExits(exits: DeepReadonly<ExitState[]>): string[] {
        if (exits.length === 0) {
            return ['  none'];
        }
        return exits.map((exit) =>
            exit.isBlocked ? `  ${exit.direction} (blocked: ${exit.blockReason})` : `  ${exit.direction}`,
        );
    }

    private describeInventory(state: DeepReadonly<GameState>): string[] {
        return ['EQUIPPED:', ...this.describeEquippedItems(state)];
    }

    private describeEquippedItems(state: DeepReadonly<GameState>): string[] {
        return [
            `  weapon: ${this.itemName(state, state.player.equipment.weapon)}`,
            `  armor: ${this.itemName(state, state.player.equipment.armor)}`,
        ];
    }

    private itemName(state: DeepReadonly<GameState>, itemId: ItemId | undefined): string {
        if (!itemId) {
            return 'none';
        }
        return state.items[itemId]?.name ?? 'none';
    }
}
