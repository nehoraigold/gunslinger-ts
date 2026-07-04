import { PlayableSession } from '../../../engine/session';
import { TurnDraft, TurnResult } from '../turn';

export interface LLMLoop {
    run(session: PlayableSession, turn: TurnDraft): Promise<TurnResult>;
}
