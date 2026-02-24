import { CombatRoundLog } from './CombatRoundLog';
import { CombatModifier } from './CombatModifier';

export interface CombatState {
    enemyId: string;
    round: number; // Current combat round (starts at 1)
    playerTurn: boolean; // True when it is the player's turn to act

    // Whether flee is possible in this encounter
    // Set to false for scripted encounters that lock the room
    canFlee: boolean;

    // Active combat modifiers (from abilities, terrain, etc.)
    playerModifiers: CombatModifier[];
    enemyModifiers: CombatModifier[];

    // Log of this encounter for compression / narration context
    roundLog: CombatRoundLog[];

    // Turn the combat started (for time tracking)
    startedAtTurn: number;
}
