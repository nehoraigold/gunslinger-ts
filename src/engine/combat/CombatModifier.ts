export interface CombatModifier {
    name: string; // e.g. "high_ground", "flanked", "haste"
    attackBonus?: number;
    defenseBonus?: number;
    damageBonus?: number;
    turnsRemaining?: number; // undefined = permanent for this combat
}
