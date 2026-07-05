import { ItemId } from '../../state';
import { Inventory } from '../../entity';
import { ItemNotFoundError } from '../../error';
import { InventoryService } from './InventoryService';
import { TransferOutcome } from './TransferOutcome';
import { ItemLookup } from './ItemLookup';

export class DefaultInventoryService implements InventoryService {
    constructor(private readonly items: ItemLookup) {}

    transfer(itemId: ItemId, from: Inventory, to: Inventory, quantity = 1): TransferOutcome {
        const item = this.items.item(itemId);
        if (!item) {
            throw new ItemNotFoundError(itemId);
        }

        if (!from.has(itemId, quantity)) {
            return { type: 'notAvailable' };
        }

        if (!item.stackable && to.has(itemId)) {
            return { type: 'alreadyPresent' };
        }

        from.remove(itemId, quantity);
        to.add(itemId, quantity);
        return { type: 'transferred', itemId, quantity };
    }
}
