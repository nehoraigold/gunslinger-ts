import { ItemId } from '../../state';

export type TransferOutcome =
    | { type: 'transferred'; itemId: ItemId; quantity: number }
    | { type: 'notAvailable' }
    | { type: 'insufficientQuantity' }
    | { type: 'maximumQuantityReached' };
