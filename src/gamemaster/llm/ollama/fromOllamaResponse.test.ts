import { describe, it } from 'mocha';
import { expect } from 'chai';
import { ChatResponse } from 'ollama';

import { fromOllamaResponse } from './fromOllamaResponse';

describe(fromOllamaResponse.name, () => {
    function createResponse(message: ChatResponse['message']): ChatResponse {
        return {
            model: 'llama3',
            created_at: new Date(),
            message,
            done: true,
            done_reason: 'stop',
            total_duration: 0,
            load_duration: 0,
            prompt_eval_count: 0,
            prompt_eval_duration: 0,
            eval_count: 0,
            eval_duration: 0,
        };
    }

    it('should return the trimmed text when there are no tool calls', () => {
        const turn = fromOllamaResponse(createResponse({ role: 'assistant', content: '  You head north.  ' }));

        expect(turn).to.deep.equal({ text: 'You head north.', toolCalls: undefined });
    });

    it('should return undefined text when the content is empty', () => {
        const turn = fromOllamaResponse(createResponse({ role: 'assistant', content: '   ' }));

        expect(turn.text).to.equal(undefined);
    });

    it('should return undefined toolCalls when there are none', () => {
        const turn = fromOllamaResponse(createResponse({ role: 'assistant', content: 'hi' }));

        expect(turn.toolCalls).to.equal(undefined);
    });

    it('should map a tool call with object arguments, synthesising an id', () => {
        const turn = fromOllamaResponse(
            createResponse({
                role: 'assistant',
                content: '',
                tool_calls: [{ function: { name: 'move', arguments: { direction: 'north' } } }],
            }),
        );

        expect(turn.toolCalls).to.deep.equal([{ id: 'ollama_move_0', name: 'move', args: { direction: 'north' } }]);
    });

    it('should parse tool call arguments given as a JSON string', () => {
        const turn = fromOllamaResponse(
            createResponse({
                role: 'assistant',
                content: '',
                tool_calls: [{ function: { name: 'move', arguments: '{"direction":"north"}' as never } }],
            }),
        );

        expect(turn.toolCalls).to.deep.equal([{ id: 'ollama_move_0', name: 'move', args: { direction: 'north' } }]);
    });

    it('should leave unparsable string arguments as-is', () => {
        const turn = fromOllamaResponse(
            createResponse({
                role: 'assistant',
                content: '',
                tool_calls: [{ function: { name: 'move', arguments: 'not json' as never } }],
            }),
        );

        expect(turn.toolCalls).to.deep.equal([{ id: 'ollama_move_0', name: 'move', args: 'not json' }]);
    });

    it('should synthesise distinct ids for multiple tool calls by index', () => {
        const turn = fromOllamaResponse(
            createResponse({
                role: 'assistant',
                content: '',
                tool_calls: [
                    { function: { name: 'move', arguments: { direction: 'north' } } },
                    { function: { name: 'move', arguments: { direction: 'south' } } },
                ],
            }),
        );

        expect(turn.toolCalls?.map((call) => call.id)).to.deep.equal(['ollama_move_0', 'ollama_move_1']);
    });
});
