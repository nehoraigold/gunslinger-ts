import { ItemId } from '../state';

export class ItemNotFoundError extends Error {
    constructor(itemId: ItemId) {
        super(`No item with ID "${itemId}"`);
        this.name = 'ItemNotFoundError';
    }
}
