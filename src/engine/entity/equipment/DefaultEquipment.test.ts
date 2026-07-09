import { describe, it, beforeEach } from 'mocha';
import { expect } from 'chai';

import { DefaultEquipment } from './DefaultEquipment';
import { RootValueStore } from '../../store';
import { EquipmentState } from '../../state';

describe(DefaultEquipment.name, () => {
    let store: RootValueStore<EquipmentState>;
    let equipment: DefaultEquipment;

    beforeEach(() => {
        store = new RootValueStore<EquipmentState>({});
        equipment = new DefaultEquipment(store);
    });

    describe('equippedIn', () => {
        it('should return undefined for an empty slot', () => {
            expect(equipment.equippedIn('weapon')).to.be.undefined;
        });

        it('should return the item occupying a slot', () => {
            equipment = new DefaultEquipment(new RootValueStore<EquipmentState>({ weapon: 'rusty_revolver' }));

            expect(equipment.equippedIn('weapon')).to.equal('rusty_revolver');
        });
    });

    describe('equip', () => {
        it('should place an item into the given slot', () => {
            equipment.equip('weapon', 'rusty_revolver');

            expect(equipment.equippedIn('weapon')).to.equal('rusty_revolver');
        });

        it('should overwrite whatever previously occupied the slot', () => {
            equipment.equip('weapon', 'rusty_revolver');
            equipment.equip('weapon', 'steel_saber');

            expect(equipment.equippedIn('weapon')).to.equal('steel_saber');
        });

        it('should persist the change back into the backing store', () => {
            equipment.equip('armor', 'leather_duster');

            expect(store.get().armor).to.equal('leather_duster');
        });

        it('should leave other slots untouched', () => {
            equipment.equip('weapon', 'rusty_revolver');
            equipment.equip('armor', 'leather_duster');

            expect(equipment.equippedIn('weapon')).to.equal('rusty_revolver');
        });
    });

    describe('unequip', () => {
        it('should empty the given slot', () => {
            equipment.equip('weapon', 'rusty_revolver');
            equipment.unequip('weapon');

            expect(equipment.equippedIn('weapon')).to.be.undefined;
        });

        it('should remove the slot key from the backing store', () => {
            equipment.equip('weapon', 'rusty_revolver');
            equipment.unequip('weapon');

            expect(store.get()).to.not.have.property('weapon');
        });

        it('should be a no-op on an already-empty slot', () => {
            equipment.unequip('armor');

            expect(equipment.equippedIn('armor')).to.be.undefined;
        });
    });
});
