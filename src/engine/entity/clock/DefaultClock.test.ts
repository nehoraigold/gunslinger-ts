import { describe, it } from 'mocha';
import { expect } from 'chai';

import { DefaultClock } from './DefaultClock';
import { RootValueStore } from '../../store';
import { ClockState } from '../../state';

describe(DefaultClock.name, () => {
    const createClock = (turn = 0) => new DefaultClock(new RootValueStore<ClockState>({ turn }));

    describe('currentTurn', () => {
        it('should return the turn held by the store', () => {
            expect(createClock(7).currentTurn()).to.equal(7);
        });
    });

    describe('advance', () => {
        it('should increment the turn by exactly one', () => {
            const clock = createClock(0);

            clock.advance();

            expect(clock.currentTurn()).to.equal(1);
        });

        it('should accumulate across repeated advances', () => {
            const clock = createClock(0);

            clock.advance();
            clock.advance();
            clock.advance();

            expect(clock.currentTurn()).to.equal(3);
        });
    });
});
