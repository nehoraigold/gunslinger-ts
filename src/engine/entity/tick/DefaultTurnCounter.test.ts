import { describe, it } from 'mocha';
import { expect } from 'chai';

import { DefaultTurnCounter } from './DefaultTurnCounter';
import { RootValueStore } from '../../store';
import { TurnCounterState } from '../../state';

describe(DefaultTurnCounter.name, () => {
    const createCounter = (count = 0) => new DefaultTurnCounter(new RootValueStore<TurnCounterState>({ count }));

    describe('currentTick', () => {
        it('should return the count held by the store', () => {
            expect(createCounter(7).currentTick()).to.equal(7);
        });
    });

    describe('advance', () => {
        it('should increment the count by exactly one', () => {
            const counter = createCounter(0);

            counter.advance();

            expect(counter.currentTick()).to.equal(1);
        });

        it('should accumulate across repeated advances', () => {
            const counter = createCounter(0);

            counter.advance();
            counter.advance();
            counter.advance();

            expect(counter.currentTick()).to.equal(3);
        });
    });
});
