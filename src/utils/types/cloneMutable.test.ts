import { describe, it } from 'mocha';
import { expect } from 'chai';

import { cloneMutable } from './cloneMutable';
import { DeepReadonly } from './DeepReadonly';

describe(cloneMutable.name, () => {
    it('should return a value deeply equal to the input', () => {
        const original: DeepReadonly<{ a: { b: number[] } }> = { a: { b: [1, 2, 3] } };

        const cloned = cloneMutable(original);

        expect(cloned).to.deep.equal(original);
    });

    it('should return a new object reference, not the original', () => {
        const original: DeepReadonly<{ a: { b: number[] } }> = { a: { b: [1, 2, 3] } };

        const cloned = cloneMutable(original);

        expect(cloned).to.not.equal(original);
        expect(cloned.a).to.not.equal(original.a);
    });

    it('should return a value whose nested properties can be mutated', () => {
        const original: DeepReadonly<{ a: number }> = { a: 1 };

        const cloned = cloneMutable<{ a: number }>(original);
        cloned.a = 2;

        expect(cloned.a).to.equal(2);
    });
});
