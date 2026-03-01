import { Ollama, Message as OllamaMessage, ChatResponse } from 'ollama';
import { getLogger } from '../../utils';
import { AgentAssistantTurn, AgentMessage, AgentToolCall, LlmClient, LlmStreamCallbacks, LlmTool } from './LlmClient';

const log = getLogger('ollama');

function toOllamaMessage(msg: AgentMessage): OllamaMessage | OllamaMessage[] {
    switch (msg.role) {
        case 'user':
            return { role: 'user', content: msg.text };

        case 'assistant': {
            const base: OllamaMessage = { role: 'assistant', content: msg.text ?? '' };
            if (msg.toolCalls?.length) {
                base.tool_calls = msg.toolCalls.map((tc) => ({
                    function: {
                        name: tc.name,
                        arguments: tc.input as Record<string, unknown>,
                    },
                }));
            }
            return base;
        }

        case 'tool_results':
            // Ollama uses one tool message per result
            return msg.results.map((r) => ({
                role: 'tool' as const,
                content: r.content,
            }));
    }
}

function fromOllamaResponse(response: ChatResponse, tools: LlmTool[]): AgentAssistantTurn {
    const msg = response.message;
    const text = msg.content?.trim() || undefined;
    const toolCalls: AgentToolCall[] = [];

    for (let i = 0; i < (msg.tool_calls?.length ?? 0); i++) {
        const tc = msg.tool_calls![i];
        // Ollama doesn't provide call IDs — synthesise one
        const id = `ollama_${tc.function.name}_${i}`;
        // arguments may arrive as a JSON string or as an object depending on model
        let input: unknown = tc.function.arguments;
        if (typeof input === 'string') {
            try {
                input = JSON.parse(input);
            } catch {
                // leave as string; executeActionByName will fail with a useful error
            }
        }
        // Resolve name: use registered tool name if present, else fall through
        const toolName = tools.find((t) => t.name === tc.function.name)?.name ?? tc.function.name;
        toolCalls.push({ id, name: toolName, input });
    }

    return {
        text,
        toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
    };
}

function buildOllamaMessages(systemPrompt: string, messages: AgentMessage[]): OllamaMessage[] {
    return [
        { role: 'system', content: systemPrompt },
        ...messages.flatMap((m) => {
            const converted = toOllamaMessage(m);
            return Array.isArray(converted) ? converted : [converted];
        }),
    ];
}

export class OllamaClient implements LlmClient {
    constructor(
        private readonly ollama: Ollama,
        private readonly model: string,
    ) {}

    async complete(systemPrompt: string, messages: AgentMessage[], tools: LlmTool[]): Promise<AgentAssistantTurn> {
        const ollamaMessages = buildOllamaMessages(systemPrompt, messages);

        log.info(`Request | model: ${this.model} | messages: ${ollamaMessages.length} | tools: ${tools.length}`);

        const response = await this.ollama.chat({
            model: this.model,
            tools: tools.map((t) => ({
                type: 'function' as const,
                function: {
                    name: t.name,
                    description: t.description,
                    parameters: t.inputSchema,
                },
            })),
            messages: ollamaMessages,
        });

        log.info(`Response | done_reason: ${response.done_reason ?? 'n/a'} | model: ${response.model}`);

        const turn = fromOllamaResponse(response, tools);

        if (turn.text && turn.toolCalls?.length) {
            log.debug(`Model thinking:\n${turn.text}`);
        }
        if (turn.toolCalls?.length) {
            log.debug(`Tool calls: ${turn.toolCalls.map((c) => `${c.name}(${JSON.stringify(c.input)})`).join(', ')}`);
        }

        return turn;
    }

    async stream(
        systemPrompt: string,
        messages: AgentMessage[],
        tools: LlmTool[],
        callbacks: LlmStreamCallbacks,
    ): Promise<AgentAssistantTurn> {
        const ollamaMessages = buildOllamaMessages(systemPrompt, messages);

        log.info(`Stream request | model: ${this.model} | messages: ${ollamaMessages.length} | tools: ${tools.length}`);

        const streamResponse = await this.ollama.chat({
            model: this.model,
            stream: true,
            tools: tools.map((t) => ({
                type: 'function' as const,
                function: {
                    name: t.name,
                    description: t.description,
                    parameters: t.inputSchema,
                },
            })),
            messages: ollamaMessages,
        });

        let accumulatedContent = '';
        let lastChunk: ChatResponse | null = null;

        for await (const chunk of streamResponse) {
            const content = chunk.message?.content;
            if (content) {
                accumulatedContent += content;
                callbacks.onText(content);
            }
            lastChunk = chunk;
        }

        if (!lastChunk) {
            return { text: undefined, toolCalls: undefined };
        }

        // Reconstruct the final response with accumulated content
        lastChunk.message.content = accumulatedContent;

        log.info(`Stream response | done_reason: ${lastChunk.done_reason ?? 'n/a'} | model: ${lastChunk.model}`);

        const turn = fromOllamaResponse(lastChunk, tools);

        if (turn.toolCalls?.length) {
            log.debug(`Tool calls: ${turn.toolCalls.map((c) => `${c.name}(${JSON.stringify(c.input)})`).join(', ')}`);
        }

        return turn;
    }
}
