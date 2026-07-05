import { Logger } from './Logger';
import { LeveledLogger } from './LeveledLogger';
import { LogLevel } from './LogLevel';
import { LogSink } from './LogSink';

export interface LoggerFactory {
    create(name: string): Logger;
}

export class DefaultLoggerFactory implements LoggerFactory {
    constructor(
        private readonly minLevel: LogLevel,
        private readonly sink: LogSink,
    ) {}

    create(name: string): Logger {
        return new LeveledLogger(name, this.minLevel, this.sink);
    }
}
