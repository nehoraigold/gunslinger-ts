import { KeyedValueStore } from './keyed_store';
import { NpcId, NpcState } from '../state/npc';

export type NpcsStore = KeyedValueStore<NpcId, NpcState>;
