import { GameSession } from '../../../engine/session';
import { ToolCall } from './ToolCall';
import { ToolResult } from './ToolResult';

export interface ToolCallDispatcher {
    dispatch(session: GameSession, call: ToolCall): ToolResult;
}
