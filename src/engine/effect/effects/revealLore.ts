import { EffectApplier } from '../EffectApplier';

export type RevealLoreEffect = { type: 'revealLore'; text: string };

// Narrative-only: the text is surfaced through UseAction's success data, not through state.
export const applyRevealLore: EffectApplier<RevealLoreEffect> = () => {};
