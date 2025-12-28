import { ollama } from 'ai-sdk-ollama';
import { ToolLoopAgent } from 'ai';
import { Action } from '../action';
import { GameState, Outcome } from '../engine';
import INSTRUCTIONS from './narrator.instructions';
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

    public async narrate(
        beforeState: GameState,
        afterState: GameState,
        action: Action,
        outcome: Outcome,
    ): Promise<string> {
        try {
            const input: NarratorInput = {
                before_state: selectNarratorGameState(beforeState),
                after_state: selectNarratorGameState(afterState),
                action,
                outcome,
            };
            return this.sendToAgent(JSON.stringify(input));
        } catch (e: any) {
            console.error(`${e}`);
            return e.message;
        }
    }

    protected async sendToAgent(prompt: string): Promise<string> {
        const response = await this.agent.generate({ prompt });
        const content = response.steps[0].content[0];
        if (content.type !== 'text') {
            throw new Error(`Narrator returned unsupported content type: ${content.type}`);
        }
        return content.text;
    }
}
