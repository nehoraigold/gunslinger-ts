import { ChatResponse } from 'ollama';
import { LLMResponse } from '../LLMResponse';
import { ActionInvocation } from '../../dispatch';

export function fromOllamaResponse(response: ChatResponse): LLMResponse {
    const message = response.message;
    const text = message.content?.trim() || undefined;
    const toolCalls = (message.tool_calls ?? []).map((call, index) => toActionInvocation(call, index));

    return { text, toolCalls: toolCalls.length > 0 ? toolCalls : undefined };
}

function toActionInvocation(
    call: NonNullable<ChatResponse['message']['tool_calls']>[number],
    index: number,
): ActionInvocation {
    return {
        id: `ollama_${call.function.name}_${index}`,
        name: call.function.name,
        args: parseArguments(call.function.arguments),
    };
}

/** Arguments may arrive as a parsed object or, depending on the model, as a raw JSON string. */
function parseArguments(args: unknown): unknown {
    if (typeof args !== 'string') {
        return args;
    }
    try {
        return JSON.parse(args);
    } catch {
        return args;
    }
}
