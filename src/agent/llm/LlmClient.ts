// Canonical internal message / turn types used by the agent.
// Adapters (AnthropicClient, OllamaClient) convert to/from native SDK types.

export type AgentMessage =
    | { role: 'user'; text: string }
    | { role: 'assistant'; text?: string; toolCalls?: AgentToolCall[] }
    | { role: 'tool_results'; results: AgentToolResult[] };

export interface AgentToolCall {
    id: string; // provider-generated (or index-based for Ollama)
    name: string; // matches action name in registry
    input: unknown; // parsed JSON from LLM
}

export interface AgentToolResult {
    callId: string;
    name: string;
    content: string; // JSON-serialised ActionOutcome
}

export interface AgentAssistantTurn {
    text?: string;
    toolCalls?: AgentToolCall[];
}

export interface LlmTool {
    name: string;
    description: string;
    inputSchema: Record<string, unknown>; // JSON Schema object
}

export interface LlmStreamCallbacks {
    onText: (chunk: string) => void;
}

export interface LlmClient {
    complete(systemPrompt: string, messages: AgentMessage[], tools: LlmTool[]): Promise<AgentAssistantTurn>;
    stream(
        systemPrompt: string,
        messages: AgentMessage[],
        tools: LlmTool[],
        callbacks: LlmStreamCallbacks,
    ): Promise<AgentAssistantTurn>;
}
