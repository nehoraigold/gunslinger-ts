import { OutcomeNarrator } from '../../OutcomeNarrator';
import { PlayableSession } from '../../../engine/session';
import { ActionInvocation, ActionResult } from '../../dispatch';
import { LLMClient } from '../LLMClient';
import { LLMRequestAssembler } from '../request';
import { TurnLifecycle } from '../lifecycle';

const CHOICE_CALL_ID = 'choice';
const CHOICE_DESCRIPTION = '(the player selects a menu option)';

export class LLMOutcomeNarrator implements OutcomeNarrator {
    constructor(
        private readonly turnLifecycle: TurnLifecycle,
        private readonly requestAssembler: LLMRequestAssembler,
        private readonly llmClient: LLMClient,
    ) {}

    async narrate(session: PlayableSession, invocation: ActionInvocation, result: ActionResult): Promise<string> {
        const turn = this.turnLifecycle.begin(session.getState(), CHOICE_DESCRIPTION);
        turn.recordToolRound(
            [{ id: CHOICE_CALL_ID, name: invocation.name, args: invocation.args }],
            [{ callId: CHOICE_CALL_ID, name: invocation.name, content: result.content }],
        );

        const request = this.requestAssembler.assemble(turn, { includeTools: false });
        const response = await this.llmClient.complete(request);
        const turnResult = turn.complete(response.text ?? '');
        return this.turnLifecycle.end(turnResult);
    }
}
