import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from 'chai';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { FileLogSink } from './FileLogSink';
import { LogRecord } from './LogRecord';

describe(FileLogSink.name, () => {
    let dir: string;
    let path: string;
    let sink: FileLogSink;

    beforeEach(() => {
        dir = mkdtempSync(join(tmpdir(), 'file-log-sink-'));
        path = join(dir, 'test.log');
        sink = new FileLogSink(path);
    });

    afterEach(() => {
        rmSync(dir, { recursive: true, force: true });
    });

    const record = (message: string): LogRecord => ({
        timestamp: new Date('2026-07-04T12:00:00.000Z'),
        level: 'info',
        name: 'test',
        message,
    });

    it('should write a formatted record followed by a newline', async () => {
        sink.write(record('hello'));
        await sink.close();

        expect(readFileSync(path, 'utf8')).to.equal('2026-07-04T12:00:00.000Z [INFO] test | hello\n');
    });

    it('should append each record on its own line in order', async () => {
        sink.write(record('first'));
        sink.write(record('second'));
        await sink.close();

        expect(readFileSync(path, 'utf8')).to.equal(
            '2026-07-04T12:00:00.000Z [INFO] test | first\n2026-07-04T12:00:00.000Z [INFO] test | second\n',
        );
    });
});
