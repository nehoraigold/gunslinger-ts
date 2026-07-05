import { createWriteStream, WriteStream } from 'node:fs';

import { LogSink } from './LogSink';
import { LogRecord } from './LogRecord';
import { formatRecord } from './formatRecord';

export class FileLogSink implements LogSink {
    private readonly stream: WriteStream;

    constructor(path: string) {
        this.stream = createWriteStream(path, { flags: 'w' });
    }

    write(record: LogRecord): void {
        this.stream.write(`${formatRecord(record)}\n`);
    }

    close(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.stream.end((error?: Error | null) => (error ? reject(error) : resolve()));
        });
    }
}
