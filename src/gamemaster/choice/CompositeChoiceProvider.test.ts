import { describe, it } from 'mocha';
import { expect } from 'chai';

import { CompositeChoiceProvider } from './CompositeChoiceProvider';
import { ChoiceProvider, OfferedChoice } from './ChoiceProvider';
import { createGameState } from '../../engine/state/GameState.test.utils';

function fakeProvider(offered: OfferedChoice[]): ChoiceProvider {
    return { compute: () => offered };
}

const CHOICE_A: OfferedChoice = { choice: { id: 'a', label: 'A' }, invocation: { name: 'a', args: {} } };
const CHOICE_B: OfferedChoice = { choice: { id: 'b', label: 'B' }, invocation: { name: 'b', args: {} } };

describe(CompositeChoiceProvider.name, () => {
    describe('compute', () => {
        it('should return an empty list when there are no providers', () => {
            const provider = new CompositeChoiceProvider([]);

            expect(provider.compute(createGameState())).to.deep.equal([]);
        });

        it('should return an empty list when every injected provider yields nothing', () => {
            const provider = new CompositeChoiceProvider([fakeProvider([]), fakeProvider([])]);

            expect(provider.compute(createGameState())).to.deep.equal([]);
        });

        it('should concatenate the choices from every injected provider', () => {
            const provider = new CompositeChoiceProvider([fakeProvider([CHOICE_A]), fakeProvider([CHOICE_B])]);

            expect(provider.compute(createGameState())).to.deep.equal([CHOICE_A, CHOICE_B]);
        });
    });
});
