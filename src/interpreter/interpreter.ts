import { ollama } from 'ai-sdk-ollama';
import { ToolLoopAgent } from 'ai';

import { Logger } from '../utils';
import { Action } from '../engine';
import { GameState } from '../engine';
import { generateInterpreterInput } from './generateInterpreterInput';
import INSTRUCTIONS from './interpreter.instructions';
import { AvailableLLMs } from '../availableLLMs';

const INTERPRETER_MODEL: AvailableLLMs = 'llama3.1:8b';

export class Interpreter {
    protected agent: ToolLoopAgent;

    constructor() {
        this.agent = new ToolLoopAgent({
            model: ollama(INTERPRETER_MODEL),
            instructions: INSTRUCTIONS,
            temperature: 0,
        });
    }

    public async parse(prompt: string, state: GameState): Promise<Action | Action[]> {
        try {
            const input = generateInterpreterInput(prompt, state);
            Logger.debug(`Interpreting: ${JSON.stringify(input, null, 2)}`);
            const response = await this.agent.generate({
                prompt: JSON.stringify(input),
            });

            const content = response.steps[0].content;
            if (content[0]?.type === 'text') {
                return JSON.parse(content[0].text);
            }
            return {
                type: 'unknown',
                data: { reason: 'unparsable', message: `Unexpected response type ${content[0]?.type} from LLM` },
            };
        } catch (error: any) {
            Logger.error(error);
            return { type: 'unknown', data: { reason: 'unparsable', message: error.message } };
        }
    }
}
