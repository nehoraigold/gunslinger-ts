import { describe, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import { ChatResponse } from 'ollama';

import { OllamaLLMClient } from './OllamaLLMClient';
import { OllamaChatClient } from './OllamaChatClient';
import { LLMRequest } from '../LLMRequest';

describe(OllamaLLMClient.name, () => {
    const request: LLMRequest = {
        systemPrompt: 'You are the Dungeon Master.',
        messages: [{ role: 'user', text: 'go north' }],
        tools: [{ name: 'move', description: 'Move the player.', inputSchema: { type: 'object', properties: {} } }],
    };

    function createResponse(message: ChatResponse['message'], done = true): ChatResponse {
        return {
            model: 'llama3',
            created_at: new Date(),
            message,
            done,
            done_reason: done ? 'stop' : '',
            total_duration: 0,
            load_duration: 0,
            prompt_eval_count: 0,
            prompt_eval_duration: 0,
            eval_count: 0,
            eval_duration: 0,
        };
    }

    describe('complete', () => {
        it('should call chat non-streaming with the translated messages and tools', async () => {
            const response = createResponse({ role: 'assistant', content: 'You head north.' });
            const chat = sinon.stub().resolves(response);
            const client = new OllamaLLMClient({ chat } as unknown as OllamaChatClient, 'llama3');

            const turn = await client.complete(request);

            expect(chat.calledOnce).to.be.true;
            const call = chat.firstCall.args[0];
            expect(call.model).to.equal('llama3');
            expect(call.stream).to.equal(false);
            expect(call.messages[0]).to.deep.equal({ role: 'system', content: 'You are the Dungeon Master.' });
            expect(call.tools).to.deep.equal([
                {
                    type: 'function',
                    function: {
                        name: 'move',
                        description: 'Move the player.',
                        parameters: { type: 'object', properties: {} },
                    },
                },
            ]);
            expect(turn).to.deep.equal({ text: 'You head north.', toolCalls: undefined });
        });
    });

    describe('stream', () => {
        async function* chunksOf(chunks: ChatResponse[]): AsyncGenerator<ChatResponse> {
            for (const chunk of chunks) {
                yield chunk;
            }
        }

        it('should call onChunk for each streamed content delta and return the accumulated turn', async () => {
            const chunks = [
                createResponse({ role: 'assistant', content: 'You head ' }, false),
                createResponse({ role: 'assistant', content: 'north.' }),
            ];
            const chat = sinon.stub().resolves(chunksOf(chunks));
            const client = new OllamaLLMClient({ chat } as unknown as OllamaChatClient, 'llama3');
            const received: string[] = [];

            const turn = await client.stream(request, (text) => received.push(text));

            expect(chat.calledOnce).to.be.true;
            expect(chat.firstCall.args[0].stream).to.equal(true);
            expect(received).to.deep.equal(['You head ', 'north.']);
            expect(turn).to.deep.equal({ text: 'You head north.', toolCalls: undefined });
        });

        it('should return an empty turn when the stream yields no chunks', async () => {
            const chat = sinon.stub().resolves(chunksOf([]));
            const client = new OllamaLLMClient({ chat } as unknown as OllamaChatClient, 'llama3');

            const turn = await client.stream(request, () => {});

            expect(turn).to.deep.equal({ text: undefined, toolCalls: undefined });
        });

        it('should include tool calls from the final chunk', async () => {
            const chunks = [
                createResponse({
                    role: 'assistant',
                    content: '',
                    tool_calls: [{ function: { name: 'move', arguments: { direction: 'north' } } }],
                }),
            ];
            const chat = sinon.stub().resolves(chunksOf(chunks));
            const client = new OllamaLLMClient({ chat } as unknown as OllamaChatClient, 'llama3');

            const turn = await client.stream(request, () => {});

            expect(turn.toolCalls).to.deep.equal([{ id: 'ollama_move_0', name: 'move', args: { direction: 'north' } }]);
        });
    });
});
