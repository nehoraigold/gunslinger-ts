// Derived combat stats. Never stored on Player — always computed via derivePlayerStats().
export interface CombatStats {
    attackPower: number; // baseStats.strength + equipped weapon attackPower (or 0)
    defense: number; // baseStats.endurance + equipped armor defense (or 0)
    initiative: number; // baseStats.agility * weapon speedModifier (or 1.0)
}
