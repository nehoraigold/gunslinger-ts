import { describe, it } from 'mocha';
import { expect } from 'chai';

import { toOllamaTools } from './toOllamaTools';
import { ToolDefinition } from '../tool';

describe(toOllamaTools.name, () => {
    it('should convert a ToolDefinition into an Ollama function tool', () => {
        const definition: ToolDefinition = {
            name: 'move',
            description: 'Move the player.',
            inputSchema: { type: 'object', properties: { direction: { type: 'string' } } },
        };

        const [tool] = toOllamaTools([definition]);

        expect(tool).to.deep.equal({
            type: 'function',
            function: {
                name: 'move',
                description: 'Move the player.',
                parameters: { type: 'object', properties: { direction: { type: 'string' } } },
            },
        });
    });

    it('should return an empty array for an empty list of definitions', () => {
        expect(toOllamaTools([])).to.deep.equal([]);
    });
});
