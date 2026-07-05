import { LogRecord } from './LogRecord';

export function formatRecord(record: LogRecord): string {
    const line = `${record.timestamp.toISOString()} [${record.level.toUpperCase()}] ${record.name} | ${record.message}`;
    if (!record.context || Object.keys(record.context).length === 0) {
        return line;
    }
    return `${line} ${JSON.stringify(record.context)}`;
}
