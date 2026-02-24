export interface NpcInventoryItem {
    itemId: string;
    quantity: number;
    forSale: boolean;
    price?: number; // In gold. Required if forSale=true
}
