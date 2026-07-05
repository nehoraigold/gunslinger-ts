import { TurnLifecycle } from './TurnLifecycle';
import { GameState } from '../../../engine/state';
import { getLogger } from '../../../utils/logger';
import { DeepReadonly } from '../../../utils/types';
import { ConversationManager } from '../conversation';
import { WorldSnapshotBuilder } from '../snapshot';
import { DefaultTurnDraft, TurnDraft, TurnResult } from '../turn';

const log = getLogger('llm.turn');

export class DefaultTurnLifecycle implements TurnLifecycle {
    constructor(
        private readonly worldSnapshotBuilder: WorldSnapshotBuilder,
        private readonly conversationManager: ConversationManager,
    ) {}

    begin(state: DeepReadonly<GameState>, rawInput: string): TurnDraft {
        const priorMessages = this.conversationManager.getMessagesForNextRequest();
        log.info('turn begin', { rawInput, priorMessages: priorMessages.length });
        const turn = DefaultTurnDraft.start(priorMessages);
        const snapshot = this.worldSnapshotBuilder.build(state);
        turn.recordUserRound(`${rawInput}\n\n${snapshot}`);
        return turn;
    }

    end(result: TurnResult): string {
        log.info('turn end', { messages: result.messages.length, narrationChars: result.text.length });
        this.conversationManager.appendTurn(result.messages);
        return result.text;
    }
}
