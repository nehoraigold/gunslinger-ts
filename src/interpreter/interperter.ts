import path from 'path';
import process from 'process';
import { readFileSync } from 'fs';
import { ollama } from 'ai-sdk-ollama';
import { ToolLoopAgent } from 'ai';
import { Action, ActionType } from '../action';
import { GameState } from '../engine';
import { selectInterpreterGameState } from './interpreter.selector';

const INSTRUCTIONS = readFileSync(path.resolve(process.cwd(), '../llm/interpreter.md'), 'utf8');
type Model = 'qwen3:8b' | 'gpt-oss:20b';

export class ActionInterpreter {
    protected agent: ToolLoopAgent;

    constructor(model: Model) {
        this.agent = new ToolLoopAgent({
            model: ollama(model),
            instructions: INSTRUCTIONS,
        });
    }

    public async parse(prompt: string, state: GameState): Promise<Action> {
        try {
            const interpreterState = selectInterpreterGameState(state);
            const response = await this.agent.generate({
                messages: [
                    {
                        role: 'system',
                        content: JSON.stringify(interpreterState),
                    },
                    {
                        role: 'user',
                        content: prompt,
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
