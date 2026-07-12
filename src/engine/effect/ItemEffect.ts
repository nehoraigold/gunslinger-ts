import { HealEffect } from './effects/heal';
import { DamageEffect } from './effects/damage';
import { UnlockEffect } from './effects/unlock';
import { RevealItemEffect } from './effects/revealItem';
import { RevealLoreEffect } from './effects/revealLore';

export type ItemEffect = HealEffect | DamageEffect | UnlockEffect | RevealItemEffect | RevealLoreEffect;
