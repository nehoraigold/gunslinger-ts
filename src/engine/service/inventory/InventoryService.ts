import { ItemId } from '../../state';
import { Inventory } from '../../entity';
import { TransferOutcome } from './TransferOutcome';

export interface InventoryService {
    transfer(itemId: ItemId, from: Inventory, to: Inventory, quantity?: number): TransferOutcome;
}
