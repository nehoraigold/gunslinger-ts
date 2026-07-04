import { describe, it } from 'mocha';
import { expect } from 'chai';

import { DefaultLLMRequestBuilder } from './DefaultLLMRequestBuilder';
import { InstructionsProvider } from '../instructions';
import { WorldSnapshotBuilder } from '../snapshot';
import { ToolCatalog, ToolDefinition, ToolCall, ToolResult } from '../tool';
import { ConversationManager, ConversationMessage } from '../conversation';
import { createGameState } from '../../../engine/state/GameState.test.utils';

describe(DefaultLLMRequestBuilder.name, () => {
    const toolDefinitions: ToolDefinition[] = [
        { name: 'move', description: 'Move the player.', inputSchema: { type: 'object', properties: {} } },
    ];

    function createBuilder(): DefaultLLMRequestBuilder {
        const instructionsProvider: InstructionsProvider = { getSystemPrompt: () => 'You are the Dungeon Master.' };
        const worldSnapshotBuilder: WorldSnapshotBuilder = { build: () => '=== WORLD STATE ===' };
        const toolCatalog: ToolCatalog = { listDefinitions: () => toolDefinitions, find: () => undefined };
        return new DefaultLLMRequestBuilder(instructionsProvider, worldSnapshotBuilder, toolCatalog);
    }

    function createConversationManager(priorMessages: ConversationMessage[]): ConversationManager {
        return {
            appendTurn: () => {},
            getMessagesForNextRequest: () => priorMessages,
            shouldCompress: () => false,
            compressAsync: () => {},
        };
    }

    describe('buildFromPlayerInput', () => {
        it('should include the system prompt and tool definitions', () => {
            const request = createBuilder().buildFromPlayerInput(
                createConversationManager([]),
                createGameState(),
                'go north',
            );

            expect(request.systemPrompt).to.equal('You are the Dungeon Master.');
            expect(request.tools).to.deep.equal(toolDefinitions);
        });

        it('should append the world snapshot to the raw input in a new user message', () => {
            const request = createBuilder().buildFromPlayerInput(
                createConversationManager([]),
                createGameState(),
                'go north',
            );

            expect(request.messages).to.deep.equal([{ role: 'user', text: 'go north\n\n=== WORLD STATE ===' }]);
        });

        it('should place the new user message after the prior conversation history', () => {
            const prior: ConversationMessage[] = [{ role: 'user', text: 'look around' }];

            const request = createBuilder().buildFromPlayerInput(
                createConversationManager(prior),
                createGameState(),
                'go north',
            );

            expect(request.messages[0]).to.deep.equal(prior[0]);
            expect(request.messages).to.have.length(2);
        });
    });

    describe('buildFromToolResults', () => {
        const toolCalls: ToolCall[] = [{ id: 'call_1', name: 'move', args: { direction: 'north' } }];
        const results: ToolResult[] = [{ callId: 'call_1', name: 'move', content: '{"result":"success"}' }];

        it('should append the assistant tool-call message and a tool_results message after prior history', () => {
            const prior: ConversationMessage[] = [{ role: 'user', text: 'go north\n\n=== WORLD STATE ===' }];

            const request = createBuilder().buildFromToolResults(createConversationManager(prior), toolCalls, results);

            expect(request.messages).to.deep.equal([
                prior[0],
                { role: 'assistant', text: undefined, toolCalls },
                { role: 'tool_results', results },
            ]);
        });

        it('should include assistant text alongside the tool calls when provided', () => {
            const request = createBuilder().buildFromToolResults(
                createConversationManager([]),
                toolCalls,
                results,
                'Let me check.',
            );

            expect(request.messages[0]).to.deep.equal({ role: 'assistant', text: 'Let me check.', toolCalls });
        });

        it('should include the system prompt and tool definitions', () => {
            const request = createBuilder().buildFromToolResults(createConversationManager([]), [], []);

            expect(request.systemPrompt).to.equal('You are the Dungeon Master.');
            expect(request.tools).to.deep.equal(toolDefinitions);
        });
    });
});
