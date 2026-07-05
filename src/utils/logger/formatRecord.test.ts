import { expect } from 'chai';

import { formatRecord } from './formatRecord';
import { LogRecord } from './LogRecord';

describe(formatRecord.name, () => {
    const base: LogRecord = {
        timestamp: new Date('2026-07-04T12:00:00.000Z'),
        level: 'info',
        name: 'llm.loop',
        message: 'turn start',
    };

    it('should render timestamp, level, name and message', () => {
        expect(formatRecord(base)).to.equal('2026-07-04T12:00:00.000Z [INFO] llm.loop | turn start');
    });

    it('should append serialized context when present', () => {
        expect(formatRecord({ ...base, context: { round: 2 } })).to.equal(
            '2026-07-04T12:00:00.000Z [INFO] llm.loop | turn start {"round":2}',
        );
    });

    it('should not append anything for empty context', () => {
        expect(formatRecord({ ...base, context: {} })).to.equal(
            '2026-07-04T12:00:00.000Z [INFO] llm.loop | turn start',
        );
    });
});
