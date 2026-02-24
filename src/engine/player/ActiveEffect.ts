import { EffectTickResult } from './EffectTickResult';

// An active effect on the player (poison, haste, shield, etc.)
export interface ActiveEffect {
    id: string; // e.g. "poisoned", "haste_potion"
    name: string; // Display name. e.g. "Poisoned"
    description: string; // How it feels. e.g. "A burning in your veins"
    turnsRemaining: number;
    onTick?: EffectTickResult; // What happens each turn while active
}
