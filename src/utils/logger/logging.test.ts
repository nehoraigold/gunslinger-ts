import { expect } from 'chai';

import { closeLogging, configureLogging, getLogger } from './logging';
import { LogRecord } from './LogRecord';
import { LogSink } from './LogSink';

class RecordingSink implements LogSink {
    readonly records: LogRecord[] = [];
    closed = false;
    write(record: LogRecord): void {
        this.records.push(record);
    }
    async close(): Promise<void> {
        this.closed = true;
    }
}

describe('logging', () => {
    afterEach(async () => {
        await closeLogging();
    });

    it('should be a no-op before configuration so tests stay silent', () => {
        const logger = getLogger('unconfigured');
        expect(() => logger.info('nothing should happen')).to.not.throw();
    });

    it('should route to the configured sink once configured', async () => {
        const sink = new RecordingSink();
        configureLogging({ level: 'info', sink });

        getLogger('llm.loop').info('turn start');

        expect(sink.records).to.have.lengthOf(1);
        expect(sink.records[0]).to.deep.include({ name: 'llm.loop', message: 'turn start' });
    });

    it('should honor a logger captured before configuration (deferred resolution)', () => {
        const logger = getLogger('early');
        const sink = new RecordingSink();
        configureLogging({ level: 'debug', sink });

        logger.debug('logged after configure');

        expect(sink.records).to.have.lengthOf(1);
    });

    it('should close the active sink', async () => {
        const sink = new RecordingSink();
        configureLogging({ level: 'info', sink });

        await closeLogging();

        expect(sink.closed).to.equal(true);
    });
});
