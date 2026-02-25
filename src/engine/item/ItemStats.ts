export interface ItemStats {
    damage?: number; // Weapon: base damage per hit
    defense?: number; // Armor: damage reduction
    speedModifier?: number; // 1.0 = no change. >1 = faster. <1 = slower
    strengthRequirement?: number; // Minimum strength stat to equip
    agilityRequirement?: number;
}
