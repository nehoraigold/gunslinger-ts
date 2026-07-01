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

    // describe('update', () => {
    //     it('calls the update function with the current data', () => {
    //         const updateFn = sinon.stub();
    //
    //         store.update('data1', updateFn);
    //
    //         expect(updateFn.calledOnce).to.be.true;
    //         expect(updateFn.firstCall.firstArg).to.deep.equal({ name: 'Data1' });
    //     });
    //
    //     it('does not call the update function if no matching id', () => {
    //         const updateFn = sinon.stub();
    //
    //         store.update('data3', updateFn);
    //
    //         expect(updateFn.notCalled).to.be.true;
    //     });
    //
    //     it('modifies the properties of the data', () => {
    //         const updateFn = (data: SampleData) => {
    //             data.description = 'Setting a description';
    //         };
    //
    //         store.update('data1', updateFn);
    //
    //         expect(store.get('data1')).to.deep.equal({ name: 'Data1', description: 'Setting a description' });
    //     });
    //
    //     it('does not modify preexisting data references', () => {
    //         const originalData1 = store.get('data1');
    //         const updateFn = (data: SampleData) => {
    //             data.description = 'Setting a description';
    //         };
    //
    //         store.update('data1', updateFn);
    //
    //         const newData1 = store.get('data1');
    //         expect(originalData1).to.deep.equal({ name: 'Data1' });
    //         expect(newData1).not.to.equal(originalData1);
    //     });
    //
    //     it('does not modify the data if an error is thrown', () => {
    //         const updateFn = sinon.mock().callsFake((data: SampleData) => {
    //             data.description = 'Setting a description';
    //             throw new Error();
    //         });
    //
    //         const invokeUpdate = () => store.update('data1', updateFn);
    //
    //         expect(invokeUpdate).to.throw();
    //         expect(updateFn.calledOnce).to.be.true;
    //         expect(updateFn.threw()).to.be.true;
    //         expect(store.get('data1')).to.deep.equal({ name: 'Data1' });
    //     });
    // });

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
