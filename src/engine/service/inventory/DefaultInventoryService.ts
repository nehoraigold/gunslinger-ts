import { ItemId } from '../../state';
import { Inventory } from '../../entity';
import { InventoryService } from './InventoryService';
import { TransferOutcome } from './TransferOutcome';
import { ItemLookup } from './ItemLookup';

export class DefaultInventoryService implements InventoryService {
    constructor(private readonly items: ItemLookup) {}

    transfer(itemId: ItemId, from: Inventory, to: Inventory, quantity = 1): TransferOutcome {
        const item = this.items.requireItem(itemId);

        if (!from.has(itemId)) {
            return { type: 'notAvailable' };
        }

        if (!from.has(itemId, quantity)) {
            return { type: 'insufficientQuantity' };
        }

        if (!item.stackable && to.has(itemId)) {
            return { type: 'maximumQuantityReached' };
        }

        from.remove(itemId, quantity);
        to.add(itemId, quantity);
        return { type: 'transferred', itemId, quantity };
    }
}
