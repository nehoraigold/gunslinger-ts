import { Logger } from './Logger';
import { LogContext, LogRecord } from './LogRecord';
import { LogLevel, isLevelEnabled } from './LogLevel';
import { LogSink } from './LogSink';

export class LeveledLogger implements Logger {
    constructor(
        private readonly name: string,
        private readonly minLevel: LogLevel,
        private readonly sink: LogSink,
        private readonly now: () => Date = () => new Date(),
    ) {}

    debug(message: string, context?: LogContext): void {
        this.log('debug', message, context);
    }

    info(message: string, context?: LogContext): void {
        this.log('info', message, context);
    }

    warn(message: string, context?: LogContext): void {
        this.log('warn', message, context);
    }

    error(message: string, context?: LogContext): void {
        this.log('error', message, context);
    }

    private log(level: LogLevel, message: string, context?: LogContext): void {
        if (!isLevelEnabled(this.minLevel, level)) {
            return;
        }
        const record: LogRecord = {
            timestamp: this.now(),
            level,
            name: this.name,
            message,
            ...(context && { context }),
        };
        this.sink.write(record);
    }
}
