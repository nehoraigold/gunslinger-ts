import { Npc } from './Npc';
import { NpcId } from '../../state';
import { NpcStore } from '../../store';

export interface NpcFactory {
    create(id: NpcId, store: NpcStore): Npc;
}
