export interface InventoryState {
  id: string;
  ownerType: "player" | "room" | "npc";
  ownerId: string;
  items: Record<string, number>;
}
