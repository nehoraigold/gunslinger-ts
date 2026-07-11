import { PlayableSession } from '../../engine/session';
import { ActionInvocation } from './ActionInvocation';
import { ActionResult } from './ActionResult';

export interface ActionDispatcher {
    dispatch(session: PlayableSession, invocation: ActionInvocation): ActionResult;
}
