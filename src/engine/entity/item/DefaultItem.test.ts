import { describe, it } from 'mocha';
import { expect } from 'chai';

import { DefaultItem } from './DefaultItem';
import { RootValueStore } from '../../store';
import { ItemState } from '../../state';

describe(DefaultItem.name, () => {
    function createDefaultItem(state?: Partial<ItemState>): DefaultItem {
        const store = new RootValueStore<ItemState>({
            name: 'Iron Key',
            description: 'A small iron key, cold to the touch.',
            type: 'key',
            stackable: false,
            value: 0,
            weight: 0,
            takeable: true,
            droppable: true,
            consumedOnUse: false,
            ...state,
        });
        return new DefaultItem('iron_key', store);
    }

    describe('id', () => {
        it('should return the id of the item', () => {
            const item = createDefaultItem();

            expect(item.id).to.equal('iron_key');
        });
    });

    describe('name', () => {
        it('should return the name from the item state', () => {
            const item = createDefaultItem({ name: 'Iron Key' });

            expect(item.name).to.equal('Iron Key');
        });
    });

    describe('description', () => {
        it('should return the description from the item state', () => {
            const item = createDefaultItem({ description: 'A small iron key.' });

            expect(item.description).to.equal('A small iron key.');
        });
    });

    describe('type', () => {
        it('should return the type from the item state', () => {
            const item = createDefaultItem({ type: 'key' });

            expect(item.type).to.equal('key');
        });
    });

    describe('stackable', () => {
        it('should return true if the item state is stackable', () => {
            const item = createDefaultItem({ stackable: true });

            expect(item.stackable).to.be.true;
        });

        it('should return false if the item state is not stackable', () => {
            const item = createDefaultItem({ stackable: false });

            expect(item.stackable).to.be.false;
        });
    });

    describe('value', () => {
        it('should return the gold value from the item state', () => {
            const item = createDefaultItem({ value: 42 });

            expect(item.value).to.equal(42);
        });
    });

    describe('weight', () => {
        it('should return the weight from the item state', () => {
            const item = createDefaultItem({ weight: 7 });

            expect(item.weight).to.equal(7);
        });
    });

    describe('takeable', () => {
        it('should return true if the item state is takeable', () => {
            const item = createDefaultItem({ takeable: true });

            expect(item.takeable).to.be.true;
        });

        it('should return false if the item state is not takeable', () => {
            const item = createDefaultItem({ takeable: false });

            expect(item.takeable).to.be.false;
        });
    });

    describe('droppable', () => {
        it('should return true if the item state is droppable', () => {
            const item = createDefaultItem({ droppable: true });

            expect(item.droppable).to.be.true;
        });

        it('should return false if the item state is not droppable', () => {
            const item = createDefaultItem({ droppable: false });

            expect(item.droppable).to.be.false;
        });
    });

    describe('useEffect', () => {
        it('should return undefined when the item state has no use effect', () => {
            const item = createDefaultItem();

            expect(item.useEffect).to.be.undefined;
        });

        it('should return the use effect from the item state', () => {
            const item = createDefaultItem({ useEffect: { type: 'heal', amount: 5 } });

            expect(item.useEffect).to.deep.equal({ type: 'heal', amount: 5 });
        });
    });

    describe('consumedOnUse', () => {
        it('should return true if the item state is consumed on use', () => {
            const item = createDefaultItem({ consumedOnUse: true });

            expect(item.consumedOnUse).to.be.true;
        });

        it('should return false if the item state is not consumed on use', () => {
            const item = createDefaultItem({ consumedOnUse: false });

            expect(item.consumedOnUse).to.be.false;
        });
    });
});
