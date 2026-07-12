import { describe, it } from 'mocha';
import { expect } from 'chai';

import { DefaultItemFactory } from './DefaultItemFactory';
import { DefaultItem } from './DefaultItem';
import { RootValueStore } from '../../store';
import { ItemState } from '../../state';

describe(DefaultItemFactory.name, () => {
    describe('create', () => {
        it('should create a DefaultItem with the given id and store', () => {
            const store = new RootValueStore<ItemState>({
                name: 'Coins',
                description: 'A handful of tarnished coins.',
                type: 'misc',
                stackable: true,
                value: 0,
                weight: 0,
                takeable: true,
                droppable: true,
                consumedOnUse: false,
            });
            const factory = new DefaultItemFactory();

            const item = factory.create('coins', store);

            expect(item).to.be.instanceOf(DefaultItem);
            expect(item.id).to.equal('coins');
        });
    });
});
