import { UseEffect } from '../../item';
import { EffectHandlerContext, UseItemResult } from './types';

type UseEffectType = UseEffect['type'];

export type EffectHandlerFn<T extends UseEffectType> = (
    ctx: EffectHandlerContext,
    effect: Extract<UseEffect, { type: T }>,
) => UseItemResult;

export type EffectHandlerRegistry = {
    [K in UseEffectType]: EffectHandlerFn<K>;
};

export function defineEffectHandler<T extends UseEffectType>(
    _type: T,
    handler: EffectHandlerFn<T>,
): EffectHandlerFn<T> {
    return handler;
}
