import { styleText } from 'node:util';

import { LogSink } from './LogSink';
import { LogLevel } from './LogLevel';
import { LogRecord } from './LogRecord';
import { formatRecord } from './formatRecord';

type TextStyle = Parameters<typeof styleText>[0];

const COLOR: Record<LogLevel, TextStyle> = {
    debug: 'dim',
    info: 'cyan',
    warn: 'yellow',
    error: 'red',
};

export class ConsoleLogSink implements LogSink {
    write(record: LogRecord): void {
        // styleText validates stderr's color support, so it stays plain when piped and honors NO_COLOR.
        const line = styleText(COLOR[record.level], formatRecord(record), { stream: process.stderr });
        process.stderr.write(`${line}\n`);
    }

    async close(): Promise<void> {}
}
