import { Context } from '../context';
import { ItemEffect } from './ItemEffect';

export type EffectApplier<E extends ItemEffect = ItemEffect> = (ctx: Context, effect: E) => void;
