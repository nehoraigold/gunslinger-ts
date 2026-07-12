import { PlayableSession } from '../engine/session';
import { ActionInvocation, ActionResult } from './dispatch';

export interface OutcomeNarrator {
    narrate(session: PlayableSession, invocation: ActionInvocation, result: ActionResult): Promise<string>;
}
