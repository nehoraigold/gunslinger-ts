import path from 'path';
import { fileURLToPath } from 'url';

import { readFileSync } from 'fs';
import { ollama } from 'ai-sdk-ollama';
import { ToolLoopAgent } from 'ai';
import { Action, ActionType } from '../action';
import { GameState } from '../engine';
import { selectInterpreterGameState } from './interpreter.selector';
import { InterpreterModel } from './interpreter.model';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const INTERPRETER_INSTRUCTIONS_FILE_PATH = path.resolve(__dirname, '../../llm/interpreter.instructions.md');

const INSTRUCTIONS = readFileSync(INTERPRETER_INSTRUCTIONS_FILE_PATH, 'utf8');
const INTERPRETER_MODEL: InterpreterModel = 'gpt-oss:20b';

export class ActionInterpreter {
    protected agent: ToolLoopAgent;

    constructor() {
        this.agent = new ToolLoopAgent({
            model: ollama(INTERPRETER_MODEL),
            instructions: INSTRUCTIONS,
            temperature: 0,
        });
    }

    public async parse(prompt: string, state: GameState): Promise<Action> {
        try {
            const interpreterState = selectInterpreterGameState(state);
            const response = await this.agent.generate({
                messages: [
                    {
                        role: 'system',
                        content: `game_state: ${JSON.stringify(interpreterState)}`,
                    },
                    {
                        role: 'user',
                        content: `action_text: "${prompt}"`,
                    },
                ],
            });
            // @ts-ignore
            return JSON.parse(response.steps[0].content[0].text);
        } catch (error) {
            console.error(error);
            return { type: ActionType.UNKNOWN, data: { reason: 'unparsable' } };
        }
    }
}
