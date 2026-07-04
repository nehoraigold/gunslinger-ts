import { describe, it } from 'mocha';
import { expect } from 'chai';

import { StaticInstructionsProvider } from './StaticInstructionsProvider';

describe(StaticInstructionsProvider.name, () => {
    describe('getSystemPrompt', () => {
        it('should return the content it was constructed with', () => {
            const provider = new StaticInstructionsProvider('You are the Dungeon Master.');

            expect(provider.getSystemPrompt()).to.equal('You are the Dungeon Master.');
        });

        it('should return the same content on repeated calls', () => {
            const provider = new StaticInstructionsProvider('You are the Dungeon Master.');

            provider.getSystemPrompt();

            expect(provider.getSystemPrompt()).to.equal('You are the Dungeon Master.');
        });
    });
});
