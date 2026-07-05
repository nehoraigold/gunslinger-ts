import { expect } from 'chai';

import { isLevelEnabled, logLevelRank, parseLogLevel } from './LogLevel';

describe('LogLevel', () => {
    describe(logLevelRank.name, () => {
        it('should order debug below error', () => {
            expect(logLevelRank('debug')).to.be.lessThan(logLevelRank('error'));
        });
    });

    describe(isLevelEnabled.name, () => {
        it('should enable a target at the minimum level', () => {
            expect(isLevelEnabled('info', 'info')).to.equal(true);
        });

        it('should enable a target above the minimum level', () => {
            expect(isLevelEnabled('info', 'error')).to.equal(true);
        });

        it('should disable a target below the minimum level', () => {
            expect(isLevelEnabled('info', 'debug')).to.equal(false);
        });
    });

    describe(parseLogLevel.name, () => {
        it('should parse a known level case-insensitively', () => {
            expect(parseLogLevel('WARN')).to.equal('warn');
        });

        it('should fall back to the default for an unknown value', () => {
            expect(parseLogLevel('verbose')).to.equal('info');
        });

        it('should fall back to the default when undefined', () => {
            expect(parseLogLevel(undefined, 'error')).to.equal('error');
        });
    });
});
