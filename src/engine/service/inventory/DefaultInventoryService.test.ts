import { describe, it } from 'mocha';
import { expect } from 'chai';

import { DefaultInventoryService } from './DefaultInventoryService';
import { DefaultInventory } from '../../entity';
import { RootValueStore } from '../../store';
import { InventoryState, ItemState } from '../../state';
import { ItemLookup } from './ItemLookup';
import { ItemNotFoundError } from '../../error';

describe(DefaultInventoryService.name, () => {
    function createInventory(state?: InventoryState): DefaultInventory {
        return new DefaultInventory(new RootValueStore<InventoryState>(state ?? {}));
    }

    function createItemLookup(items: Record<string, ItemState>): ItemLookup {
        const item = (id: string) => {
            const state = items[id];
            return state && { id, ...state };
        };
        return {
            item,
            requireItem: (id) => {
                const found = item(id);
                if (!found) {
                    throw new ItemNotFoundError(id);
                }
                return found;
            },
        };
    }

    describe('transfer', () => {
        it('should move the default quantity of 1 from one inventory to another', () => {
            const items = createItemLookup({
                coins: {
                    name: 'Coins',
                    description: '',
                    type: 'misc',
                    stackable: true,
                    value: 0,
                    weight: 0,
                    takeable: true,
                    droppable: true,
                },
            });
            const service = new DefaultInventoryService(items);
            const from = createInventory({ coins: 3 });
            const to = createInventory();

            const outcome = service.transfer('coins', from, to);

            expect(outcome).to.deep.equal({ type: 'transferred', itemId: 'coins', quantity: 1 });
            expect(from.quantityOf('coins')).to.equal(2);
            expect(to.quantityOf('coins')).to.equal(1);
        });

        it('should move a given quantity from one inventory to another', () => {
            const items = createItemLookup({
                coins: {
                    name: 'Coins',
                    description: '',
                    type: 'misc',
                    stackable: true,
                    value: 0,
                    weight: 0,
                    takeable: true,
                    droppable: true,
                },
            });
            const service = new DefaultInventoryService(items);
            const from = createInventory({ coins: 5 });
            const to = createInventory();

            const outcome = service.transfer('coins', from, to, 3);

            expect(outcome).to.deep.equal({ type: 'transferred', itemId: 'coins', quantity: 3 });
            expect(from.quantityOf('coins')).to.equal(2);
            expect(to.quantityOf('coins')).to.equal(3);
        });

        it('should throw an ItemNotFoundError when no item definition exists with that id', () => {
            const service = new DefaultInventoryService(createItemLookup({}));
            const from = createInventory({ coins: 1 });
            const to = createInventory();

            const transfer = () => service.transfer('nonexistent_item', from, to);

            expect(transfer).to.throw(ItemNotFoundError, /nonexistent_item/);
        });

        it('should return insufficientQuantity when the source has some but fewer than requested', () => {
            const items = createItemLookup({
                coins: {
                    name: 'Coins',
                    description: '',
                    type: 'misc',
                    stackable: true,
                    value: 0,
                    weight: 0,
                    takeable: true,
                    droppable: true,
                },
            });
            const service = new DefaultInventoryService(items);
            const from = createInventory({ coins: 1 });
            const to = createInventory();

            const outcome = service.transfer('coins', from, to, 2);

            expect(outcome).to.deep.equal({ type: 'insufficientQuantity' });
            expect(from.quantityOf('coins')).to.equal(1);
            expect(to.quantityOf('coins')).to.equal(0);
        });

        it('should move a non-stackable item into an empty destination', () => {
            const items = createItemLookup({
                iron_key: {
                    name: 'Iron Key',
                    description: '',
                    type: 'key',
                    stackable: false,
                    value: 0,
                    weight: 0,
                    takeable: true,
                    droppable: true,
                },
            });
            const service = new DefaultInventoryService(items);
            const from = createInventory({ iron_key: 1 });
            const to = createInventory();

            const outcome = service.transfer('iron_key', from, to);

            expect(outcome).to.deep.equal({ type: 'transferred', itemId: 'iron_key', quantity: 1 });
            expect(from.quantityOf('iron_key')).to.equal(0);
            expect(to.quantityOf('iron_key')).to.equal(1);
        });

        it('should return notAvailable when the source inventory does not have the item at all', () => {
            const items = createItemLookup({
                coins: {
                    name: 'Coins',
                    description: '',
                    type: 'misc',
                    stackable: true,
                    value: 0,
                    weight: 0,
                    takeable: true,
                    droppable: true,
                },
            });
            const service = new DefaultInventoryService(items);
            const from = createInventory();
            const to = createInventory();

            const outcome = service.transfer('coins', from, to);

            expect(outcome).to.deep.equal({ type: 'notAvailable' });
        });

        it('should return maximumQuantityReached when moving a second non-stackable item into a destination that already has one', () => {
            const items = createItemLookup({
                iron_key: {
                    name: 'Iron Key',
                    description: '',
                    type: 'key',
                    stackable: false,
                    value: 0,
                    weight: 0,
                    takeable: true,
                    droppable: true,
                },
            });
            const service = new DefaultInventoryService(items);
            const from = createInventory({ iron_key: 1 });
            const to = createInventory({ iron_key: 1 });

            const outcome = service.transfer('iron_key', from, to);

            expect(outcome).to.deep.equal({ type: 'maximumQuantityReached' });
            expect(from.quantityOf('iron_key')).to.equal(1);
            expect(to.quantityOf('iron_key')).to.equal(1);
        });

        it('should allow moving a stackable item into a destination that already has some', () => {
            const items = createItemLookup({
                coins: {
                    name: 'Coins',
                    description: '',
                    type: 'misc',
                    stackable: true,
                    value: 0,
                    weight: 0,
                    takeable: true,
                    droppable: true,
                },
            });
            const service = new DefaultInventoryService(items);
            const from = createInventory({ coins: 1 });
            const to = createInventory({ coins: 4 });

            const outcome = service.transfer('coins', from, to);

            expect(outcome).to.deep.equal({ type: 'transferred', itemId: 'coins', quantity: 1 });
            expect(to.quantityOf('coins')).to.equal(5);
        });
    });
});
