import { ollama } from 'ai-sdk-ollama';
import { ToolLoopAgent } from 'ai';
import { Action, ActionType } from '../engine/action';
import { GameState } from '../engine';
import { selectInterpreterGameState } from './interpreter.selector';
import INSTRUCTIONS from './interpreter.instructions';
import { AvailableLLMs } from '../availableLLMs';

const INTERPRETER_MODEL: AvailableLLMs = 'gpt-oss:20b';

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
            const interpreterState = selectInterpreterGameState(state);
            const input = JSON.stringify({
                game_state: interpreterState,
                action_text: prompt,
            });
            const response = await this.agent.generate({
                prompt: input,
            });
            // @ts-ignore
            return JSON.parse(response.steps[0].content[0].text);
        } catch (error: any) {
            console.error(error);
            return { type: ActionType.UNKNOWN, data: { reason: 'unparsable', message: error.message } };
        }
    }
}
