import { Room } from './Room';
import { Direction, InventoryState, LightLevel, RoomId } from '../../state';
import { DerivedValueStore, RoomStore } from '../../store';
import { DefaultExit, Exit } from '../exit';
import { Inventory, DefaultInventory } from '../inventory';

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
