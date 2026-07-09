import { describe, it } from 'mocha';
import { expect } from 'chai';

import { DefaultEquipmentService } from './DefaultEquipmentService';
import { DefaultInventory, DefaultEquipment } from '../../entity';
import { RootValueStore } from '../../store';
import { EquipmentState, InventoryState, ItemState } from '../../state';
import { ItemLookup } from '../inventory/ItemLookup';
import { ItemNotFoundError } from '../../error';

describe(DefaultEquipmentService.name, () => {
    const weapon: ItemState = {
        name: 'Rusty Revolver',
        description: '',
        type: 'weapon',
        stackable: false,
        value: 10,
        weight: 2,
        takeable: true,
        droppable: true,
    };
    const saber: ItemState = { ...weapon, name: 'Steel Saber' };
    const armor: ItemState = { ...weapon, name: 'Leather Duster', type: 'armor' };
    const potion: ItemState = { ...weapon, name: 'Potion', type: 'consumable', stackable: true };

    function createItemLookup(items: Record<string, ItemState>): ItemLookup {
        const item = (id: string) => {
            const state = items[id];
            return state && { id, ...state };
        };
        return {
            item,
            requireItem: (id) => {
                const found = item(id);
                if (!found) {
                    throw new ItemNotFoundError(id);
                }
                return found;
            },
        };
    }

    function createService(
        items: Record<string, ItemState>,
        inventoryState: InventoryState = {},
        equipmentState: EquipmentState = {},
    ) {
        const inventory = new DefaultInventory(new RootValueStore<InventoryState>(inventoryState));
        const equipment = new DefaultEquipment(new RootValueStore<EquipmentState>(equipmentState));
        const service = new DefaultEquipmentService(createItemLookup(items), inventory, equipment);
        return { service, inventory, equipment };
    }

    describe('equip', () => {
        it('should move a carried weapon into the weapon slot', () => {
            const { service, inventory, equipment } = createService({ revolver: weapon }, { revolver: 1 });

            const outcome = service.equip('revolver');

            expect(outcome).to.deep.equal({
                type: 'equipped',
                itemId: 'revolver',
                slot: 'weapon',
                displaced: undefined,
            });
            expect(equipment.equippedIn('weapon')).to.equal('revolver');
            expect(inventory.has('revolver')).to.be.false;
        });

        it('should route armor into the armor slot', () => {
            const { service, equipment } = createService({ duster: armor }, { duster: 1 });

            service.equip('duster');

            expect(equipment.equippedIn('armor')).to.equal('duster');
        });

        it('should swap the previously-equipped item back into the inventory', () => {
            const { service, inventory, equipment } = createService(
                { revolver: weapon, saber },
                { saber: 1 },
                { weapon: 'revolver' },
            );

            const outcome = service.equip('saber');

            expect(outcome).to.deep.equal({ type: 'equipped', itemId: 'saber', slot: 'weapon', displaced: 'revolver' });
            expect(equipment.equippedIn('weapon')).to.equal('saber');
            expect(inventory.has('revolver')).to.be.true;
            expect(inventory.has('saber')).to.be.false;
        });

        it('should leave surplus copies of the equipped item in the inventory', () => {
            const stackableWeapon: ItemState = { ...weapon, stackable: true };
            const { service, inventory, equipment } = createService({ revolver: stackableWeapon }, { revolver: 3 });

            service.equip('revolver');

            expect(equipment.equippedIn('weapon')).to.equal('revolver');
            expect(inventory.quantityOf('revolver')).to.equal(2);
        });

        it('should reject an item whose type is not equippable', () => {
            const { service } = createService({ potion }, { potion: 1 });

            expect(service.equip('potion')).to.deep.equal({ type: 'notEquippable' });
        });

        it('should reject an item the player is not carrying', () => {
            const { service } = createService({ revolver: weapon });

            expect(service.equip('revolver')).to.deep.equal({ type: 'notCarried' });
        });

        it('should report an item already occupying its slot as already equipped', () => {
            const { service } = createService({ revolver: weapon }, {}, { weapon: 'revolver' });

            expect(service.equip('revolver')).to.deep.equal({ type: 'alreadyEquipped' });
        });
    });

    describe('unequip', () => {
        it('should return the equipped item to the inventory and empty the slot', () => {
            const { service, inventory, equipment } = createService({ revolver: weapon }, {}, { weapon: 'revolver' });

            const outcome = service.unequip('weapon');

            expect(outcome).to.deep.equal({ type: 'unequipped', itemId: 'revolver', slot: 'weapon' });
            expect(equipment.equippedIn('weapon')).to.be.undefined;
            expect(inventory.has('revolver')).to.be.true;
        });

        it('should report an empty slot', () => {
            const { service } = createService({});

            expect(service.unequip('armor')).to.deep.equal({ type: 'slotEmpty' });
        });
    });
});
