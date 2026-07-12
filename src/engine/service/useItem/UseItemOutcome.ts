import { ItemEffect } from '../../effect';

export type UseItemOutcome = { type: 'used'; effect: ItemEffect } | { type: 'notCarried' } | { type: 'notUsable' };
