import { describe, it } from 'mocha';
import { expect } from 'chai';

import { DefaultHealth } from './DefaultHealth';
import { RootValueStore } from '../../store';
import { HealthState } from '../../state';
import { NegativeHealthAmountError } from '../../error';

describe(DefaultHealth.name, () => {
    function createHealth(current = 10, max = 10): DefaultHealth {
        return new DefaultHealth(new RootValueStore<HealthState>({ current, max }));
    }

    describe('current', () => {
        it('should return the current health', () => {
            const health = createHealth(6, 10);

            expect(health.current()).to.equal(6);
        });
    });

    describe('max', () => {
        it('should return the max health', () => {
            const health = createHealth(6, 10);

            expect(health.max()).to.equal(10);
        });
    });

    describe('isAlive', () => {
        it('should be true when current health is above zero', () => {
            expect(createHealth(1, 10).isAlive()).to.be.true;
        });

        it('should be false when current health is zero', () => {
            expect(createHealth(0, 10).isAlive()).to.be.false;
        });
    });

    describe('heal', () => {
        it('should increase current health by the amount', () => {
            const health = createHealth(4, 10);

            health.heal(3);

            expect(health.current()).to.equal(7);
        });

        it('should clamp at max health', () => {
            const health = createHealth(8, 10);

            health.heal(5);

            expect(health.current()).to.equal(10);
        });

        it('should throw when the amount is negative', () => {
            const health = createHealth(4, 10);

            expect(() => health.heal(-1)).to.throw(NegativeHealthAmountError);
            expect(health.current()).to.equal(4);
        });
    });

    describe('damage', () => {
        it('should decrease current health by the amount', () => {
            const health = createHealth(8, 10);

            health.damage(3);

            expect(health.current()).to.equal(5);
        });

        it('should clamp at zero', () => {
            const health = createHealth(2, 10);

            health.damage(5);

            expect(health.current()).to.equal(0);
        });

        it('should throw when the amount is negative', () => {
            const health = createHealth(8, 10);

            expect(() => health.damage(-1)).to.throw(NegativeHealthAmountError);
            expect(health.current()).to.equal(8);
        });
    });
});
