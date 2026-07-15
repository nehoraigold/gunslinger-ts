import { RoomId } from '../engine/state';
import { GameMaster } from '../gamemaster';
import { SaveController } from './save';

export interface GameApp {
    readonly gameMaster: GameMaster;
    readonly saveController: SaveController;
    currentRoomId(): RoomId;
    resetConversation(): void;
}
