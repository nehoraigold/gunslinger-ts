import { describe, it } from 'mocha';
import { expect } from 'chai';

import { equipSlotForItemType } from './equipSlotForItemType';
import { ItemType } from '../../state';

describe(equipSlotForItemType.name, () => {
    it('should map a weapon to the weapon slot', () => {
        expect(equipSlotForItemType('weapon')).to.equal('weapon');
    });

    it('should map armor to the armor slot', () => {
        expect(equipSlotForItemType('armor')).to.equal('armor');
    });

    it('should return undefined for non-equippable item types', () => {
        const nonEquippable: ItemType[] = ['consumable', 'key', 'lore', 'misc'];

        for (const type of nonEquippable) {
            expect(equipSlotForItemType(type), type).to.be.undefined;
        }
    });
});
