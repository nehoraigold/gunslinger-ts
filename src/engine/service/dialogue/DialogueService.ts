import { NpcId } from '../../state';
import { Player } from '../../entity';

export interface DialogueService {
    startConversation(player: Player, npcId: NpcId): void;
}
