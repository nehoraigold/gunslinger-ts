import { ValueStore } from './value_store';
import { TurnCounterState } from '../state/tick';

export type TurnCounterStore = ValueStore<TurnCounterState>;
