import { ValueStore } from './value_store';
import { TurnCounterState } from '../state/turn';

export type TurnCounterStore = ValueStore<TurnCounterState>;
