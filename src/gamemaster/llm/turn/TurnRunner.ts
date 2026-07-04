import { GameSession } from '../../../engine/session';
import { ConversationManager } from '../conversation';

export interface TurnRunner {
    runTurn(session: GameSession, conversationManager: ConversationManager, rawInput: string): ReadableStream<string>;
}
