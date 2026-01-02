import { ollama } from 'ai-sdk-ollama';
import { ToolLoopAgent } from 'ai';

import { GameState, Event } from '../engine';
import INSTRUCTIONS from './narrator.instructions';
import { NarratorInput } from './narrator.input';
import { selectNarratorGameState } from './narrator.selector';
import { AvailableLLMs } from '../availableLLMs';

const NARRATOR_MODEL: AvailableLLMs = 'gpt-oss:20b';

export class Narrator {
    protected readonly mode: 'on' | 'off';
    protected readonly agent: ToolLoopAgent;

    constructor(config: any) {
        this.mode = config.narration ?? 'on';
        this.agent = new ToolLoopAgent({
            model: ollama(NARRATOR_MODEL),
            instructions: INSTRUCTIONS,
            temperature: 0.4,
        });
    }

    public async narrate(beforeState: GameState, afterState: GameState, events: Event[]): Promise<string> {
        if (this.mode === 'off') {
            return JSON.stringify(events, null, 2);
        }

        try {
            const input: NarratorInput = {
                before_state: selectNarratorGameState(beforeState),
                after_state: selectNarratorGameState(afterState),
                events: events,
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
