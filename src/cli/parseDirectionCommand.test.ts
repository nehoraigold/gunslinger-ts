import { describe, it } from 'mocha';
import { expect } from 'chai';

import { parseDirectionCommand } from './parseDirectionCommand';

describe(parseDirectionCommand.name, () => {
    it('should parse a full direction word', () => {
        expect(parseDirectionCommand('north')).to.equal('north');
    });

    it('should parse a single-letter alias', () => {
        expect(parseDirectionCommand('n')).to.equal('north');
    });

    it('should parse a direction word within a longer phrase', () => {
        expect(parseDirectionCommand('go north')).to.equal('north');
    });

    it('should be case-insensitive', () => {
        expect(parseDirectionCommand('NORTH')).to.equal('north');
    });

    it('should return undefined for unrecognized input', () => {
        expect(parseDirectionCommand('dance')).to.be.undefined;
    });

    it('should return undefined for empty input', () => {
        expect(parseDirectionCommand('   ')).to.be.undefined;
    });
});
