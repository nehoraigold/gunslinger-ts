import { NpcId } from '../../state';
import { Player } from '../../entity';
import { Context } from '../../context';
import { OnTurnEffect } from '../../session/OnTurnEffect';
import { DialogueService } from './DialogueService';

export class DefaultDialogueService implements DialogueService, OnTurnEffect {
    startConversation(player: Player, npcId: NpcId): void {
        player.startConversation(npcId);
    }

    apply(context: Context): void {
        const player = context.player();
        const partnerId = player.conversationPartnerId;
        if (partnerId !== undefined && !context.requireCurrentRoom().npcIds().includes(partnerId)) {
            player.endConversation();
        }
    }
}
