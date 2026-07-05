import { expect } from 'chai';

import { LeveledLogger } from './LeveledLogger';
import { LogRecord } from './LogRecord';
import { LogSink } from './LogSink';

class RecordingSink implements LogSink {
    readonly records: LogRecord[] = [];
    write(record: LogRecord): void {
        this.records.push(record);
    }
    async close(): Promise<void> {}
}

describe(LeveledLogger.name, () => {
    const fixedNow = () => new Date('2026-07-04T00:00:00.000Z');

    it('should emit a record at or above the minimum level', () => {
        const sink = new RecordingSink();
        const logger = new LeveledLogger('llm.loop', 'info', sink, fixedNow);

        logger.warn('rounds exceeded');

        expect(sink.records).to.have.lengthOf(1);
        expect(sink.records[0]).to.deep.include({ level: 'warn', name: 'llm.loop', message: 'rounds exceeded' });
        expect(sink.records[0].timestamp.toISOString()).to.equal('2026-07-04T00:00:00.000Z');
    });

    it('should drop a record below the minimum level', () => {
        const sink = new RecordingSink();
        const logger = new LeveledLogger('llm.loop', 'info', sink, fixedNow);

        logger.debug('per-token detail');

        expect(sink.records).to.be.empty;
    });

    it('should attach structured context when provided', () => {
        const sink = new RecordingSink();
        const logger = new LeveledLogger('llm.loop', 'debug', sink, fixedNow);

        logger.info('llm call', { round: 2, messages: 4 });

        expect(sink.records[0].context).to.deep.equal({ round: 2, messages: 4 });
    });

    it('should omit context entirely when none is provided', () => {
        const sink = new RecordingSink();
        const logger = new LeveledLogger('llm.loop', 'debug', sink, fixedNow);

        logger.info('turn start');

        expect(sink.records[0]).to.not.have.property('context');
    });
});
