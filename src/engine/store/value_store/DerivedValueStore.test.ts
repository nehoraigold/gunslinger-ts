import { describe, it } from 'mocha';
import { expect } from 'chai';
import * as sinon from 'sinon';

import { DerivedValueStore } from './DerivedValueStore';

describe(DerivedValueStore.name, () => {
    describe('get', () => {
        it('should invoke the provided getter', () => {
            const getter = sinon.stub();
            const store = new DerivedValueStore(getter, sinon.stub());

            store.get();

            expect(getter.calledOnce).to.be.true;
        });

        it('should return a clone of the getter return value', () => {
            const initialState = { name: 'Player' };
            const getter = sinon.stub().returns(initialState);
            const store = new DerivedValueStore(getter, sinon.stub());

            const result = store.get();

            expect(result).to.deep.equal(initialState);
            expect(result).not.to.equal(initialState);
        });

        it('should propagate errors if thrown by getter', () => {
            const getter = sinon.stub().throws();
            const store = new DerivedValueStore(getter, sinon.stub());

            const getFn = () => store.get();

            expect(getFn).to.throw();
        });
    });

    describe('update', () => {
        it('should invoke the getter, updateFn, and setter', () => {
            const getter = sinon.stub();
            const setter = sinon.stub();
            const updateFn = sinon.stub();
            const store = new DerivedValueStore(getter, setter);

            store.update(updateFn);

            expect(getter.calledOnce).to.be.true;
            expect(updateFn.calledOnce).to.be.true;
            expect(setter.calledOnce).to.be.true;
        });

        it('should call the updateFn with a clone of the data returned by getter', () => {
            const state = { name: 'Player' };
            const getter = sinon.stub().returns(state);
            const setter = sinon.stub();
            const updateFn = sinon.stub();
            const store = new DerivedValueStore(getter, setter);

            store.update(updateFn);

            expect(updateFn.args[0][0]).to.deep.equal(state);
            expect(updateFn.args[0][0]).not.to.equal(state);
        });

        it('should call the setter with changes made by the updateFn', () => {
            const state = { name: 'Player' };
            const getter = sinon.stub().returns(state);
            const setter = sinon.stub();
            const updateFn = sinon.stub().callsFake((draft) => (draft.id = '1234'));
            const store = new DerivedValueStore(getter, setter);

            store.update(updateFn);

            expect(setter.args[0][0]).to.deep.equal({ name: 'Player', id: '1234' });
        });

        it('should propagate errors if thrown by the getter', () => {
            const getter = sinon.stub().throws();
            const store = new DerivedValueStore(getter, sinon.stub());

            const update = () => store.update(sinon.stub());

            expect(update).to.throw();
        });

        it('should propagate errors if thrown by the setter', () => {
            const setter = sinon.stub().throws();
            const store = new DerivedValueStore(sinon.stub(), setter);

            const update = () => store.update(sinon.stub());

            expect(update).to.throw();
        });

        it('should propagate errors if thrown by the updateFn', () => {
            const updateFn = sinon.stub().throws();
            const store = new DerivedValueStore(sinon.stub(), sinon.stub());

            const update = () => store.update(updateFn);

            expect(update).to.throw();
        });
    });
});
