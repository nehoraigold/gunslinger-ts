import { GameSession } from '../engine/session';
import { GameMaster, ConversationManager } from '../gamemaster';
import { SaveController } from './save';

export interface GameApp {
    readonly session: GameSession;
    readonly saveController: SaveController;
    readonly gameMaster: GameMaster;
    readonly conversationManager: ConversationManager;
}
