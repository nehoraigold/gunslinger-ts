import { describe, it } from 'mocha';
import { expect } from 'chai';

import { deriveHealthProse } from './HealthProse';

describe(deriveHealthProse.name, () => {
    it('should be healthy at full health', () => {
        expect(deriveHealthProse(10, 10)).to.equal('healthy');
    });

    it('should be bruised just below full health', () => {
        expect(deriveHealthProse(9, 10)).to.equal('bruised');
    });

    it('should be wounded around mid health', () => {
        expect(deriveHealthProse(5, 10)).to.equal('wounded');
    });

    it('should be battered when critically low but alive', () => {
        expect(deriveHealthProse(2, 10)).to.equal('battered');
    });

    it('should be fatal at zero health', () => {
        expect(deriveHealthProse(0, 10)).to.equal('fatal');
    });
});
