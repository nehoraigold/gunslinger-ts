import { LogRecord } from './LogRecord';

export interface LogSink {
    write(record: LogRecord): void;
    close(): Promise<void>;
}
