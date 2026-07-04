import { describe, it } from 'mocha';
import { expect } from 'chai';

import { DefaultLLMRequestAssembler } from './DefaultLLMRequestAssembler';
import { InstructionsProvider } from '../instructions';
import { ToolDefinition } from '../tool';
import { ConversationMessage } from '../conversation';
import { TurnDraft } from '../turn';

describe(DefaultLLMRequestAssembler.name, () => {
    const toolDefinitions: ToolDefinition[] = [
        { name: 'move', description: 'Move the player.', inputSchema: { type: 'object', properties: {} } },
    ];

    function createAssembler(): DefaultLLMRequestAssembler {
        const instructionsProvider: InstructionsProvider = { getSystemPrompt: () => 'You are the Dungeon Master.' };
        return new DefaultLLMRequestAssembler(instructionsProvider, toolDefinitions);
    }

    function fakeTurn(messages: ConversationMessage[]): TurnDraft {
        return {
            toRequestMessages: () => messages,
            recordUserRound: () => undefined,
            recordToolRound: () => undefined,
            complete: () => ({ text: '', messages: [] }),
        };
    }

    describe('assemble', () => {
        it('should include the system prompt and tool definitions', () => {
            const request = createAssembler().assemble(fakeTurn([]));

            expect(request.systemPrompt).to.equal('You are the Dungeon Master.');
            expect(request.tools).to.deep.equal(toolDefinitions);
        });

        it("should use the turn's request messages verbatim", () => {
            const messages: ConversationMessage[] = [
                { role: 'user', text: 'look around' },
                { role: 'user', text: 'go north\n\nsnapshot' },
            ];

            const request = createAssembler().assemble(fakeTurn(messages));

            expect(request.messages).to.deep.equal(messages);
        });
    });
});
