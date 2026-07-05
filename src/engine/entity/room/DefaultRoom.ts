import { Room } from './Room';
import { Direction, InventoryState, RoomId } from '../../state';
import { DerivedValueStore, RoomStore } from '../../store';
import { DefaultExit, Exit } from '../exit';
import { Inventory, DefaultInventory } from '../inventory';

export class DefaultRoom implements Room {
    constructor(
        public readonly id: RoomId,
        private readonly store: RoomStore,
    ) {}

    getExit(direction: Direction): Exit | undefined {
        const { exits } = this.store.get();
        const exitState = exits.find((exit) => exit.direction === direction);
        return exitState ? new DefaultExit(exitState, this.store) : undefined;
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
