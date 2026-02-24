// Loot entry in a drop table
export interface LootEntry {
    itemId: string;
    dropChance: number; // 0.0–1.0
    quantity: number;
}
