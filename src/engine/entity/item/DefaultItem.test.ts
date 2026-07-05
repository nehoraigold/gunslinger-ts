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
});
