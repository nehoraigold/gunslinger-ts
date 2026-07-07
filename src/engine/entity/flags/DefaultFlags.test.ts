import { describe, it } from 'mocha';
import { expect } from 'chai';

import { DefaultFlags } from './DefaultFlags';
import { RootValueStore } from '../../store';
import { FlagsState } from '../../state';

describe(DefaultFlags.name, () => {
    const createFlags = (initial: FlagsState = {}) => new DefaultFlags(new RootValueStore<FlagsState>(initial));

    describe('get', () => {
        it('should return the value held for a set flag', () => {
            expect(createFlags({ gate_open: true }).get('gate_open')).to.equal(true);
        });

        it('should return undefined for an unset flag', () => {
            expect(createFlags().get('missing')).to.be.undefined;
        });

        it('should return falsy stored values as themselves, not undefined', () => {
            const flags = createFlags({ count: 0, label: '' });

            expect(flags.get('count')).to.equal(0);
            expect(flags.get('label')).to.equal('');
        });
    });

    describe('has', () => {
        it('should return true for a set flag, even when its value is falsy', () => {
            expect(createFlags({ count: 0 }).has('count')).to.be.true;
        });

        it('should return false for an unset flag', () => {
            expect(createFlags().has('missing')).to.be.false;
        });
    });

    describe('set', () => {
        it('should return undefined as the previous value when the flag was unset', () => {
            expect(createFlags().set('gate_open', true)).to.be.undefined;
        });

        it('should return the replaced value as the previous value when overwriting', () => {
            const flags = createFlags({ gold: 5 });

            expect(flags.set('gold', 10)).to.equal(5);
        });

        it('should persist the new value into the store', () => {
            const store = new RootValueStore<FlagsState>({});
            const flags = new DefaultFlags(store);

            flags.set('gate_open', true);

            expect(store.get().gate_open).to.equal(true);
            expect(flags.get('gate_open')).to.equal(true);
        });
    });
});
