import { expect } from 'chai';
import sinon from 'sinon';

import { ConsoleLogSink } from './ConsoleLogSink';
import { LogRecord } from './LogRecord';

const stripAnsi = (text: string): string => text.replace(/\[[0-9;]*m/g, '');

describe(ConsoleLogSink.name, () => {
    const record: LogRecord = {
        timestamp: new Date('2026-07-04T12:00:00.000Z'),
        level: 'warn',
        name: 'llm.loop',
        message: 'turn start',
    };

    afterEach(() => sinon.restore());

    it('should write the formatted line to stderr, not stdout (to spare the narration)', () => {
        const stderr = sinon.stub(process.stderr, 'write');
        const stdout = sinon.stub(process.stdout, 'write');

        new ConsoleLogSink().write(record);

        expect(stdout.called).to.equal(false);
        expect(stripAnsi(stderr.firstCall.args[0] as string)).to.equal(
            '2026-07-04T12:00:00.000Z [WARN] llm.loop | turn start\n',
        );
    });
});
