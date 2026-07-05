import { Logger } from './Logger';
import { LogContext } from './LogRecord';
import { LoggerFactory, DefaultLoggerFactory } from './LoggerFactory';
import { LogLevel } from './LogLevel';
import { LogSink } from './LogSink';
import { noopLogger } from './NoopLogger';

/**
 * Convenience layer over the injectable {@link LoggerFactory}. Until `configureLogging` runs at the
 * composition root every logger is a no-op, which keeps the engine and its tests silent and deterministic.
 */

let factory: LoggerFactory | null = null;
let activeSink: LogSink | null = null;

export interface LoggingOptions {
    level: LogLevel;
    sink: LogSink;
}

export function configureLogging(options: LoggingOptions): void {
    factory = new DefaultLoggerFactory(options.level, options.sink);
    activeSink = options.sink;
}

/**
 * Resolves the factory per call rather than at capture: a logger stored at module load emits for calls made
 * after `configureLogging` runs. Calls made before are dropped, not buffered.
 */
export function getLogger(name: string): Logger {
    return new DeferredLogger(name);
}

export async function closeLogging(): Promise<void> {
    await activeSink?.close();
    factory = null;
    activeSink = null;
}

class DeferredLogger implements Logger {
    constructor(private readonly name: string) {}

    debug(message: string, context?: LogContext): void {
        this.resolve().debug(message, context);
    }

    info(message: string, context?: LogContext): void {
        this.resolve().info(message, context);
    }

    warn(message: string, context?: LogContext): void {
        this.resolve().warn(message, context);
    }

    error(message: string, context?: LogContext): void {
        this.resolve().error(message, context);
    }

    private resolve(): Logger {
        return factory ? factory.create(this.name) : noopLogger;
    }
}
