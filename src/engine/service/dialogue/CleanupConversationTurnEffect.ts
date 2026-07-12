import { Context } from '../../context';
import { OnTurnEffect } from '../../session/OnTurnEffect';
import { DialogueService } from './DialogueService';

export class CleanupConversationTurnEffect implements OnTurnEffect {
    constructor(private readonly dialogueService: DialogueService) {}

    apply(context: Context): void {
        this.dialogueService.endStaleConversation(context.player(), context.requireCurrentRoom());
    }
}
