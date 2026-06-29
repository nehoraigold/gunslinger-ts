import { describe, it } from 'mocha';
import { expect } from 'chai';
import * as sinon from 'sinon';

import { ValueStoreImpl } from './ValueStoreImpl';

describe(ValueStoreImpl.name, () => {
    const initialData = {
        name: 'keyname',
        value: 'value',
    };

    let store: ValueStoreImpl<typeof initialData>;

    beforeEach(() => {
        store = new ValueStoreImpl(initialData);
    });

    describe('get', () => {
        it('returns a clone of the initial value', () => {
            const value = store.get();

            expect(value).to.deep.equal(initialData);
            expect(value).not.to.equal(initialData);
        });
    });

    describe('update', () => {
        it('calls the provided update function', () => {
            const updateFn = sinon.spy();

            store.update(updateFn);

            expect(updateFn.calledOnce).to.equal(true);
        });

        it('modifies the value in the store', () => {
            const updateFn = (data: typeof initialData) => {
                data.value = 'new value';
            };

            store.update(updateFn);

            expect(store.get().value).to.equal('new value');
        });

        it('does not modify the original value', () => {
            const data = store.get();
            const updateFn = (data: typeof initialData) => {
                data.value = 'new value';
            };

            store.update(updateFn);

            expect(data.value).to.equal('value');
            expect(store.get().value).to.equal('new value');
        });

        it('does not modify the value if the function throws', () => {
            const updateFn = (data: typeof initialData) => {
                data.value = 'new value';
                throw new Error();
            };

            const invokeUpdate = () => store.update(updateFn);

            expect(invokeUpdate).to.throw();
            expect(store.get().value).to.equal('value');
        });

        it('does not allow for modification of a saved reference outside the update function', () => {
            let savedRef: typeof initialData;
            const updateFn = (data: typeof initialData) => {
                savedRef = data;
            };

            store.update(updateFn);
            savedRef!.value = 'new value';

            expect(store.get().value).to.equal('value');
        });
    });
});
