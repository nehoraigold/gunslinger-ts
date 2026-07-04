import { GameMaster } from '../GameMaster';
import { GameSession } from '../../engine/session';
import { ConversationManager } from './conversation';
import { TurnRunner } from './turn';

export class LLMGameMaster implements GameMaster {
    constructor(
        private readonly session: GameSession,
        private readonly conversationManager: ConversationManager,
        private readonly turnRunner: TurnRunner,
    ) {}

    handleInput(rawText: string): ReadableStream<string> {
        return this.turnRunner.runTurn(this.session, this.conversationManager, rawText);
    }
}
