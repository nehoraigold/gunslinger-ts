import { describe, it } from 'mocha';
import { expect } from 'chai';

import { toOllamaMessages } from './toOllamaMessages';
import { LLMRequest } from '../LLMRequest';

describe(toOllamaMessages.name, () => {
    function createRequest(messages: LLMRequest['messages']): LLMRequest {
        return { systemPrompt: 'You are the Dungeon Master.', messages, tools: [] };
    }

    it('should lead with a system message built from the system prompt', () => {
        const result = toOllamaMessages(createRequest([]));

        expect(result[0]).to.deep.equal({ role: 'system', content: 'You are the Dungeon Master.' });
    });

    it('should convert a user message', () => {
        const result = toOllamaMessages(createRequest([{ role: 'user', text: 'go north' }]));

        expect(result[1]).to.deep.equal({ role: 'user', content: 'go north' });
    });

    it('should convert an assistant message with no tool calls', () => {
        const result = toOllamaMessages(createRequest([{ role: 'assistant', text: 'You head north.' }]));

        expect(result[1]).to.deep.equal({ role: 'assistant', content: 'You head north.' });
    });

    it('should convert an assistant message with tool calls', () => {
        const result = toOllamaMessages(
            createRequest([
                {
                    role: 'assistant',
                    toolCalls: [{ id: 'call_1', name: 'move', args: { direction: 'north' } }],
                },
            ]),
        );

        expect(result[1]).to.deep.equal({
            role: 'assistant',
            content: '',
            tool_calls: [{ function: { name: 'move', arguments: { direction: 'north' } } }],
        });
    });

    it('should convert a tool_results message into one message per result', () => {
        const result = toOllamaMessages(
            createRequest([
                {
                    role: 'tool_results',
                    results: [
                        { callId: 'call_1', name: 'move', content: '{"result":"success"}' },
                        { callId: 'call_2', name: 'lookRoom', content: '{"result":"success"}' },
                    ],
                },
            ]),
        );

        expect(result.slice(1)).to.deep.equal([
            { role: 'tool', content: '{"result":"success"}' },
            { role: 'tool', content: '{"result":"success"}' },
        ]);
    });

    it('should preserve the order of multiple messages', () => {
        const result = toOllamaMessages(
            createRequest([
                { role: 'user', text: 'go north' },
                { role: 'assistant', text: 'You head north.' },
            ]),
        );

        expect(result).to.deep.equal([
            { role: 'system', content: 'You are the Dungeon Master.' },
            { role: 'user', content: 'go north' },
            { role: 'assistant', content: 'You head north.' },
        ]);
    });
});
