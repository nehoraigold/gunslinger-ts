export interface ItemStats {
    attackPower?: number; // Weapon: base attack power added to player strength
    defense?: number; // Armor: damage reduction
    speedModifier?: number; // 1.0 = no change. >1 = faster. <1 = slower
    strengthRequirement?: number; // Minimum strength stat to equip
    agilityRequirement?: number;
}
