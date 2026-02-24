import { PlayerStats } from './PlayerStats';
import { FlagValue } from '../flag';

// The result of an effect firing at turn end
export interface EffectTickResult {
    damagePerTurn?: number; // Poison
    healPerTurn?: number; // Regeneration
    statModifiers?: Partial<PlayerStats>; // Haste, slow, etc.
    flagsSet?: Record<string, FlagValue>;
}
