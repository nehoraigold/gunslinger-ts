import { ActionInvocation } from '../dispatch';

export type LLMResponse = {
    text?: string;
    toolCalls?: ActionInvocation[];
};
