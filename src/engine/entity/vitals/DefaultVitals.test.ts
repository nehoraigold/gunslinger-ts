import { describe, it } from 'mocha';
import { expect } from 'chai';

import { DefaultVitals } from './DefaultVitals';
import { NegativeVitalsAmountError } from '../../error';

describe(DefaultVitals.name, () => {
    function createVitals(current = 10, max = 10): DefaultVitals {
        let health = current;
        return new DefaultVitals(
            () => health,
            (next) => {
                health = next;
            },
            () => max,
        );
    }

    describe('current', () => {
        it('should return the current health', () => {
            const vitals = createVitals(6, 10);

            expect(vitals.current()).to.equal(6);
        });
    });

    describe('max', () => {
        it('should return the max health', () => {
            const vitals = createVitals(6, 10);

            expect(vitals.max()).to.equal(10);
        });
    });

    describe('isAlive', () => {
        it('should be true when current health is above zero', () => {
            expect(createVitals(1, 10).isAlive()).to.be.true;
        });

        it('should be false when current health is zero', () => {
            expect(createVitals(0, 10).isAlive()).to.be.false;
        });
    });

    describe('heal', () => {
        it('should increase current health by the amount', () => {
            const vitals = createVitals(4, 10);

            vitals.heal(3);

            expect(vitals.current()).to.equal(7);
        });

        it('should clamp at max health', () => {
            const vitals = createVitals(8, 10);

            vitals.heal(5);

            expect(vitals.current()).to.equal(10);
        });

        it('should throw when the amount is negative', () => {
            const vitals = createVitals(4, 10);

            expect(() => vitals.heal(-1)).to.throw(NegativeVitalsAmountError);
            expect(vitals.current()).to.equal(4);
        });
    });

    describe('damage', () => {
        it('should decrease current health by the amount', () => {
            const vitals = createVitals(8, 10);

            vitals.damage(3);

            expect(vitals.current()).to.equal(5);
        });

        it('should clamp at zero', () => {
            const vitals = createVitals(2, 10);

            vitals.damage(5);

            expect(vitals.current()).to.equal(0);
        });

        it('should throw when the amount is negative', () => {
            const vitals = createVitals(8, 10);

            expect(() => vitals.damage(-1)).to.throw(NegativeVitalsAmountError);
            expect(vitals.current()).to.equal(8);
        });
    });
});
