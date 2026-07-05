import { describe, it } from 'mocha';
import { expect } from 'chai';

import { DefaultInventory } from './DefaultInventory';
import { RootValueStore } from '../../store';
import { InventoryState } from '../../state';

describe(DefaultInventory.name, () => {
    function createDefaultInventory(state?: InventoryState): DefaultInventory {
        return new DefaultInventory(new RootValueStore<InventoryState>(state ?? {}));
    }

    describe('quantityOf', () => {
        it('should return the quantity held for a given item', () => {
            const inventory = createDefaultInventory({ coins: 3 });

            expect(inventory.quantityOf('coins')).to.equal(3);
        });

        it('should return 0 for an item not held', () => {
            const inventory = createDefaultInventory();

            expect(inventory.quantityOf('coins')).to.equal(0);
        });
    });

    describe('has', () => {
        it('should return true when holding at least the default quantity of 1', () => {
            const inventory = createDefaultInventory({ iron_key: 1 });

            expect(inventory.has('iron_key')).to.be.true;
        });

        it('should return false when holding none of the item', () => {
            const inventory = createDefaultInventory();

            expect(inventory.has('iron_key')).to.be.false;
        });

        it('should compare against an explicit quantity', () => {
            const inventory = createDefaultInventory({ coins: 3 });

            expect(inventory.has('coins', 3)).to.be.true;
            expect(inventory.has('coins', 4)).to.be.false;
        });
    });

    describe('add', () => {
        it('should add the default quantity of 1 when none is given', () => {
            const inventory = createDefaultInventory();

            inventory.add('iron_key');

            expect(inventory.quantityOf('iron_key')).to.equal(1);
        });

        it('should add to an existing quantity', () => {
            const inventory = createDefaultInventory({ coins: 3 });

            inventory.add('coins', 2);

            expect(inventory.quantityOf('coins')).to.equal(5);
        });
    });

    describe('remove', () => {
        it('should remove the default quantity of 1 when none is given', () => {
            const inventory = createDefaultInventory({ coins: 3 });

            inventory.remove('coins');

            expect(inventory.quantityOf('coins')).to.equal(2);
        });

        it('should remove down to 0 and drop the entry once fully removed', () => {
            const inventory = createDefaultInventory({ iron_key: 1 });

            inventory.remove('iron_key');

            expect(inventory.quantityOf('iron_key')).to.equal(0);
            expect(inventory.list()).to.deep.equal([]);
        });

        it('should not go below 0 when removing more than is held', () => {
            const inventory = createDefaultInventory({ coins: 2 });

            inventory.remove('coins', 5);

            expect(inventory.quantityOf('coins')).to.equal(0);
        });
    });

    describe('list', () => {
        it('should return an entry for each item held', () => {
            const inventory = createDefaultInventory({ coins: 3, iron_key: 1 });

            const entries = inventory.list();

            expect(entries).to.have.deep.members([
                { itemId: 'coins', quantity: 3 },
                { itemId: 'iron_key', quantity: 1 },
            ]);
        });

        it('should return an empty list for an empty inventory', () => {
            const inventory = createDefaultInventory();

            expect(inventory.list()).to.deep.equal([]);
        });
    });
});
