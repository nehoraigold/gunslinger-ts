import { describe, it } from 'mocha';
import { expect } from 'chai';

import { DefaultLLMRequestBuilder } from './DefaultLLMRequestBuilder';
import { InstructionsProvider } from '../instructions';
import { WorldSnapshotBuilder } from '../snapshot';
import { ToolDefinition, ToolCall, ToolResult } from '../tool';
import { ConversationMessage } from '../conversation';
import { createGameState } from '../../../engine/state/GameState.test.utils';

describe(DefaultLLMRequestBuilder.name, () => {
    const toolDefinitions: ToolDefinition[] = [
        { name: 'move', description: 'Move the player.', inputSchema: { type: 'object', properties: {} } },
    ];

    function createBuilder(): DefaultLLMRequestBuilder {
        const instructionsProvider: InstructionsProvider = { getSystemPrompt: () => 'You are the Dungeon Master.' };
        const worldSnapshotBuilder: WorldSnapshotBuilder = { build: () => '=== WORLD STATE ===' };
        return new DefaultLLMRequestBuilder(instructionsProvider, worldSnapshotBuilder, toolDefinitions);
    }

    describe('buildFromPlayerInput', () => {
        it('should include the system prompt and tool definitions', () => {
            const { request } = createBuilder().buildFromPlayerInput([], createGameState(), 'go north');

            expect(request.systemPrompt).to.equal('You are the Dungeon Master.');
            expect(request.tools).to.deep.equal(toolDefinitions);
        });

        it('should append the world snapshot to the raw input in a new user message', () => {
            const { request, newMessages } = createBuilder().buildFromPlayerInput([], createGameState(), 'go north');

            const userMessage = { role: 'user' as const, text: 'go north\n\n=== WORLD STATE ===' };
            expect(request.messages).to.deep.equal([userMessage]);
            expect(newMessages).to.deep.equal([userMessage]);
        });

        it('should place the new user message after the prior conversation history', () => {
            const prior: ConversationMessage[] = [{ role: 'user', text: 'look around' }];

            const { request } = createBuilder().buildFromPlayerInput(prior, createGameState(), 'go north');

            expect(request.messages[0]).to.deep.equal(prior[0]);
            expect(request.messages).to.have.length(2);
        });
    });

    describe('buildFromToolResults', () => {
        const toolCalls: ToolCall[] = [{ id: 'call_1', name: 'move', args: { direction: 'north' } }];
        const results: ToolResult[] = [{ callId: 'call_1', name: 'move', content: '{"result":"success"}' }];

        it('should append the assistant tool-call message and a tool_results message after prior history', () => {
            const prior: ConversationMessage[] = [{ role: 'user', text: 'go north\n\n=== WORLD STATE ===' }];

            const { request, newMessages } = createBuilder().buildFromToolResults(prior, toolCalls, results);

            const expectedNewMessages = [
                { role: 'assistant' as const, text: undefined, toolCalls },
                { role: 'tool_results' as const, results },
            ];
            expect(request.messages).to.deep.equal([prior[0], ...expectedNewMessages]);
            expect(newMessages).to.deep.equal(expectedNewMessages);
        });

        it('should include assistant text alongside the tool calls when provided', () => {
            const { newMessages } = createBuilder().buildFromToolResults([], toolCalls, results, 'Let me check.');

            expect(newMessages[0]).to.deep.equal({ role: 'assistant', text: 'Let me check.', toolCalls });
        });

        it('should include the system prompt and tool definitions', () => {
            const { request } = createBuilder().buildFromToolResults([], [], []);

            expect(request.systemPrompt).to.equal('You are the Dungeon Master.');
            expect(request.tools).to.deep.equal(toolDefinitions);
        });
    });
});
