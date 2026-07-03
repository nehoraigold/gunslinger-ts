import { describe, it } from 'mocha';
import { expect } from 'chai';
import * as sinon from 'sinon';

import { DefaultKeyedValueStore } from './DefaultKeyedValueStore';

describe(DefaultKeyedValueStore.name, () => {
    type SampleData = {
        name: string;
        description?: string;
    };
    type SampleState = Record<string, SampleData>;
    let store: DefaultKeyedValueStore<string, SampleData>;

    const createSampleState = (state?: SampleState): SampleState => {
        return {
            data1: {
                name: 'Data1',
            },
            data2: {
                name: 'Data2',
            },
            ...state,
        };
    };

    beforeEach(() => {
        store = new DefaultKeyedValueStore(createSampleState());
    });

    describe('get', () => {
        it('returns data values provided in constructor', () => {
            const data1 = store.get('data1');
            const data2 = store.get('data2');

            expect(data1).to.deep.equal({ name: 'Data1' });
            expect(data2).to.deep.equal({ name: 'Data2' });
        });

        it('returns undefined if no matching id', () => {
            const data3 = store.get('data3');

            expect(data3).to.be.undefined;
        });
    });

    describe('getAll', () => {
        it('returns all data values', () => {
            const values = store.getAll();

            expect(values).to.deep.equal(createSampleState());
        });

        it('returns empty object if no entries', () => {
            store.remove('data1');
            store.remove('data2');

            const values = store.getAll();

            expect(values).to.deep.equal({});
        });
    });

    describe('store', () => {
        it('returns undefined if no matching id', () => {
            const valueStore = store.store('data3');

            expect(valueStore).to.be.undefined;
        });

        it('returns a value store whose get() reflects the current stored value', () => {
            const valueStore = store.store('data1');

            expect(valueStore!.get()).to.deep.equal({ name: 'Data1' });
        });

        it('persists updates made through the returned value store back into the keyed store', () => {
            const valueStore = store.store('data1')!;

            valueStore.update((data) => {
                data.description = 'Setting a description';
            });

            expect(store.get('data1')).to.deep.equal({ name: 'Data1', description: 'Setting a description' });
        });

        it('does not modify other entries when updating one', () => {
            const valueStore = store.store('data1')!;

            valueStore.update((data) => {
                data.description = 'Setting a description';
            });

            expect(store.get('data2')).to.deep.equal({ name: 'Data2' });
        });

        it('reflects updates made through one handle when read through another handle for the same id', () => {
            const firstHandle = store.store('data1')!;
            const secondHandle = store.store('data1')!;

            firstHandle.update((data) => {
                data.description = 'Setting a description';
            });

            expect(secondHandle.get()).to.deep.equal({ name: 'Data1', description: 'Setting a description' });
        });
    });

    describe('remove', () => {
        const expectOtherEntriesUnchanged = () => {
            expect(store.get('data1')).to.deep.equal({ name: 'Data1' });
            expect(store.get('data2')).to.deep.equal({ name: 'Data2' });
        };

        it('should not throw an error if no matching id', () => {
            const deleteFn = () => store.remove('data3');

            expect(deleteFn).not.to.throw();
            expectOtherEntriesUnchanged();
        });

        it('should delete the data with the matching id from the store', () => {
            store.add('data3', { name: 'Data3' });
            const data = store.get('data3');
            expect(data).not.to.be.undefined;

            store.remove('data3');

            expect(store.get('data3')).to.be.undefined;
            expectOtherEntriesUnchanged();
        });
    });

    describe('add', () => {
        it('creates a new entry with the correct id and data', () => {
            const data = { name: 'Data3' };

            store.add('data3', data);

            expect(store.get('data3')).to.deep.equal({ name: 'Data3' });
        });

        it('creates a new object reference', () => {
            const data = { name: 'Data3' };

            store.add('data3', data);

            expect(store.get('data3')).not.to.equal(data);
        });

        it('creates a new object reference so that modification must happen through the store', () => {
            const data: SampleData = { name: 'Data3' };

            store.add('data3', data);

            data.description = 'Setting a description outside the store';
            expect(store.get('data3')).not.to.haveOwnProperty('description');
        });

        it('does not create a new object if an entry already exists with that id', () => {
            const data = { name: 'Data3' };

            store.add('data1', data);

            expect(store.get('data1')).to.deep.equal({ name: 'Data1' });
        });
    });
});
