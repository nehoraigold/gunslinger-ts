import Anthropic from '@anthropic-ai/sdk';
import { getLogger } from '../../utils';
import { AgentAssistantTurn, AgentMessage, LlmClient, LlmTool } from './LlmClient';

const log = getLogger('anthropic');

function toAnthropicMessage(msg: AgentMessage): Anthropic.MessageParam {
    switch (msg.role) {
        case 'user':
            return { role: 'user', content: msg.text };

        case 'assistant': {
            const content: Anthropic.ContentBlockParam[] = [];
            if (msg.text) {
                content.push({ type: 'text', text: msg.text } satisfies Anthropic.TextBlockParam);
            }
            for (const tc of msg.toolCalls ?? []) {
                content.push({
                    type: 'tool_use',
                    id: tc.id,
                    name: tc.name,
                    input: tc.input as Record<string, unknown>,
                } satisfies Anthropic.ToolUseBlockParam);
            }
            return { role: 'assistant', content };
        }

        case 'tool_results':
            return {
                role: 'user',
                content: msg.results.map(
                    (r) =>
                        ({
                            type: 'tool_result' as const,
                            tool_use_id: r.callId,
                            content: r.content,
                        }) satisfies Anthropic.ToolResultBlockParam,
                ),
            };
    }
}

function fromAnthropicResponse(response: Anthropic.Message): AgentAssistantTurn {
    let text: string | undefined;
    const toolCalls: AgentAssistantTurn['toolCalls'] = [];

    for (const block of response.content) {
        if (block.type === 'text') {
            text = (text ?? '') + block.text;
        } else if (block.type === 'tool_use') {
            toolCalls!.push({
                id: block.id,
                name: block.name,
                input: block.input,
            });
        }
    }

    return {
        text: text?.trim() || undefined,
        toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
    };
}

export class AnthropicClient implements LlmClient {
    constructor(
        private readonly client: Anthropic,
        private readonly model: string,
        private readonly maxTokens: number = 2048,
    ) {}

    async complete(systemPrompt: string, messages: AgentMessage[], tools: LlmTool[]): Promise<AgentAssistantTurn> {
        log.info(`Request | model: ${this.model} | messages: ${messages.length} | tools: ${tools.length}`);

        const response = await this.client.messages.create({
            model: this.model,
            max_tokens: this.maxTokens,
            system: systemPrompt,
            tools: tools.map((t) => ({
                name: t.name,
                description: t.description,
                input_schema: t.inputSchema as Anthropic.Tool['input_schema'],
            })),
            messages: messages.map(toAnthropicMessage),
        });

        const { stop_reason, usage } = response;
        log.info(`Response | stop_reason: ${stop_reason} | tokens: ${usage.input_tokens}→${usage.output_tokens}`);

        const turn = fromAnthropicResponse(response);

        // Log thinking text: any text block emitted alongside tool calls
        if (turn.text && turn.toolCalls?.length) {
            log.debug(`Model thinking:\n${turn.text}`);
        }
        if (turn.toolCalls?.length) {
            log.debug(`Tool calls: ${turn.toolCalls.map((c) => `${c.name}(${JSON.stringify(c.input)})`).join(', ')}`);
        }

        return turn;
    }
}
