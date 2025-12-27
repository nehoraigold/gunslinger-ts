import { ollama } from 'ai-sdk-ollama';
import { ToolLoopAgent } from 'ai';
import { Action } from '../action';
import { GameState } from '../engine';
import INSTRUCTIONS from './narrator.instructions.md';
import { NarratorInput } from './narrator.input';
import { selectNarratorGameState } from './narrator.selector';

type NarratorModel = 'gpt-oss:20b';
const NARRATOR_MODEL: NarratorModel = 'gpt-oss:20b';

export class Narrator {
    protected readonly agent: ToolLoopAgent;

    constructor() {
        this.agent = new ToolLoopAgent({
            model: ollama(NARRATOR_MODEL),
            instructions: INSTRUCTIONS,
            temperature: 0.4,
        });
    }

    public begin(state: GameState): Promise<string> {
        try {
            return this.sendToAgent(JSON.stringify({ state: selectNarratorGameState(state) }));
        } catch (e: any) {
            console.error(e);
            return e.message;
        }
    }

    public async narrate(beforeState: GameState, afterState: GameState, action: Action, result: any): Promise<string> {
        try {
            const input: NarratorInput = {
                before_state: selectNarratorGameState(beforeState),
                after_state: selectNarratorGameState(afterState),
                action,
                action_resolution: result,
            };
            return this.sendToAgent(JSON.stringify(input));
        } catch (e: any) {
            console.error(`${e}`);
            return e.message;
        }
    }

    protected async sendToAgent(prompt: string): Promise<string> {
        const response = await this.agent.generate({ prompt });
        // @ts-ignore
        return response.steps[0].content[0].text;
    }
}
