import { LogLevel } from './LogLevel';

export type LogContext = Record<string, unknown>;

export interface LogRecord {
    readonly timestamp: Date;
    readonly level: LogLevel;
    readonly name: string;
    readonly message: string;
    readonly context?: LogContext;
}
