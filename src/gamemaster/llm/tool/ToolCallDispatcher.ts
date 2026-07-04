import { PlayableSession } from '../../../engine/session';
import { ToolCall } from './ToolCall';
import { ToolResult } from './ToolResult';

export interface ToolCallDispatcher {
    dispatch(session: PlayableSession, call: ToolCall): ToolResult;
}
