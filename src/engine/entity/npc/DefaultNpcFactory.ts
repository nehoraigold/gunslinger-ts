import { NpcFactory } from './NpcFactory';
import { NpcId } from '../../state';
import { NpcStore } from '../../store';
import { Npc } from './Npc';
import { DefaultNpc } from './DefaultNpc';

export class DefaultNpcFactory implements NpcFactory {
    create(id: NpcId, store: NpcStore): Npc {
        return new DefaultNpc(id, store);
    }
}
