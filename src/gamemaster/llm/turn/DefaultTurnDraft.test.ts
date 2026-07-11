import { describe, it } from 'mocha';
import { expect } from 'chai';

import { DefaultTurnDraft } from './DefaultTurnDraft';
import { TurnDraft } from './TurnDraft';
import { ActionInvocation, ActionResult } from '../../dispatch';
import { ConversationMessage } from '../conversation';

describe(DefaultTurnDraft.name, () => {
    const priorMessages: ConversationMessage[] = [{ role: 'user', text: 'look around' }];

    function createDraft(): TurnDraft {
        return DefaultTurnDraft.start(priorMessages);
    }

    describe('toRequestMessages', () => {
        it('should return only the prior conversation history when nothing has been recorded yet', () => {
            const draft = createDraft();

            expect(draft.toRequestMessages()).to.deep.equal(priorMessages);
        });

        it('should reflect messages recorded since construction', () => {
            const draft = createDraft();
            const toolCalls: ActionInvocation[] = [{ id: 'call_1', name: 'move', args: { direction: 'north' } }];
            const results: ActionResult[] = [{ callId: 'call_1', name: 'move', content: '{"result":"success"}' }];

            draft.recordUserRound('go north\n\nsnapshot');
            draft.recordToolRound(toolCalls, results);

            expect(draft.toRequestMessages()).to.deep.equal([
                ...priorMessages,
                { role: 'user', text: 'go north\n\nsnapshot' },
                { role: 'assistant', text: undefined, toolCalls },
                { role: 'tool_results', results },
            ]);
        });
    });

    describe('recordUserRound', () => {
        it('should append a plain user message with the given text', () => {
            const draft = createDraft();

            draft.recordUserRound('go north\n\nsnapshot');

            expect(draft.toRequestMessages()).to.deep.equal([
                ...priorMessages,
                { role: 'user', text: 'go north\n\nsnapshot' },
            ]);
        });
    });

    describe('recordToolRound', () => {
        it('should append the assistant tool-call message and a tool_results message', () => {
            const draft = createDraft();
            const toolCalls: ActionInvocation[] = [{ id: 'call_1', name: 'move', args: { direction: 'north' } }];
            const results: ActionResult[] = [{ callId: 'call_1', name: 'move', content: '{"result":"success"}' }];

            draft.recordToolRound(toolCalls, results, 'Let me check.');

            expect(draft.toRequestMessages().slice(-2)).to.deep.equal([
                { role: 'assistant', text: 'Let me check.', toolCalls },
                { role: 'tool_results', results },
            ]);
        });
    });

    describe('complete', () => {
        it('should append a plain assistant message with the given text', () => {
            const draft = createDraft();

            draft.complete('You head north.');

            expect(draft.toRequestMessages()).to.deep.equal([
                ...priorMessages,
                { role: 'assistant', text: 'You head north.' },
            ]);
        });

        it('should return a TurnResult with the text and only the messages recorded during the turn', () => {
            const draft = createDraft();
            const toolCalls: ActionInvocation[] = [{ id: 'call_1', name: 'move', args: { direction: 'north' } }];
            const results: ActionResult[] = [{ callId: 'call_1', name: 'move', content: '{"result":"success"}' }];
            draft.recordUserRound('go north\n\nsnapshot');
            draft.recordToolRound(toolCalls, results);

            const result = draft.complete('You head north.');

            expect(result).to.deep.equal({
                text: 'You head north.',
                messages: [
                    { role: 'user', text: 'go north\n\nsnapshot' },
                    { role: 'assistant', text: undefined, toolCalls },
                    { role: 'tool_results', results },
                    { role: 'assistant', text: 'You head north.' },
                ],
            });
        });
    });
});
