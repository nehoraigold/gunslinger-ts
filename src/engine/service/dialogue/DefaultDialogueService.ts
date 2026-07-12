import { Npc, Player, Room } from '../../entity';
import { DialogueService } from './DialogueService';

export class DefaultDialogueService implements DialogueService {
    converseWith(player: Player, npc: Npc): void {
        player.converseWith(npc);
    }

    endStaleConversation(player: Player, room: Room): void {
        const partnerId = player.conversationPartnerId;
        if (partnerId !== undefined && !room.npcIds().includes(partnerId)) {
            player.endConversation();
        }
    }
}
