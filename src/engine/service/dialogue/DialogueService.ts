import { Npc, Player, Room } from '../../entity';

export interface DialogueService {
    converseWith(player: Player, npc: Npc): void;
    endStaleConversation(player: Player, room: Room): void;
}
