import { describe, it } from 'mocha';
import { expect } from 'chai';

import { DefaultTurnCounter } from './DefaultTurnCounter';
import { RootValueStore } from '../../store';
import { TurnCounterState } from '../../state';

describe(DefaultTurnCounter.name, () => {
    const createCounter = (count = 0) => new DefaultTurnCounter(new RootValueStore<TurnCounterState>({ count }));

    describe('current', () => {
        it('should return the count held by the store', () => {
            expect(createCounter(7).current()).to.equal(7);
        });
    });

    describe('increment', () => {
        it('should increment the count by exactly one', () => {
            const counter = createCounter(0);

            counter.increment();

            expect(counter.current()).to.equal(1);
        });

        it('should accumulate across repeated increments', () => {
            const counter = createCounter(0);

            counter.increment();
            counter.increment();
            counter.increment();

            expect(counter.current()).to.equal(3);
        });
    });
});
