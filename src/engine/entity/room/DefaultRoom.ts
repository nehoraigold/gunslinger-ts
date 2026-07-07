import { Room } from './Room';
import { Direction, InventoryState, LightLevel, NpcId, RoomId } from '../../state';
import { Condition } from '../../condition/Condition';
import { DerivedValueStore, RoomStore } from '../../store';
import { DefaultExit, Exit } from '../exit';
import { Inventory, DefaultInventory } from '../inventory';
import { cloneMutable } from '../../../utils/types';

export class DefaultRoom implements Room {
    constructor(
        public readonly id: RoomId,
        private readonly store: RoomStore,
    ) {}

    get name(): string {
        return this.store.get().name;
    }

    get description(): string {
        return this.store.get().description;
    }

    get lightLevel(): LightLevel {
        return this.store.get().lightLevel;
    }

    get visited(): boolean {
        return this.store.get().visited;
    }

    getExit(direction: Direction): Exit | undefined {
        const { exits } = this.store.get();
        const exitState = exits.find((exit) => exit.direction === direction);
        return exitState ? new DefaultExit(direction, this.store) : undefined;
    }

    exits(): Exit[] {
        return this.store.get().exits.map((exit) => new DefaultExit(exit.direction, this.store));
    }

    markVisited(): void {
        this.store.update((state) => {
            state.visited = true;
        });
    }

    npcIds(): NpcId[] {
        return [...this.store.get().npcIds];
    }

    entryCondition(): Condition | undefined {
        const condition = this.store.get().entryCondition;
        return condition ? cloneMutable<Condition>(condition) : undefined;
    }

    inventory(): Inventory {
        return new DefaultInventory(
            new DerivedValueStore<InventoryState>(
                () => this.store.get().inventory,
                (inventory) =>
                    this.store.update((state) => {
                        state.inventory = inventory;
                    }),
            ),
        );
    }
}
