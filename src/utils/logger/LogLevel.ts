export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const ORDER: readonly LogLevel[] = ['debug', 'info', 'warn', 'error'];

export function logLevelRank(level: LogLevel): number {
    return ORDER.indexOf(level);
}

export function isLevelEnabled(minimum: LogLevel, target: LogLevel): boolean {
    return logLevelRank(target) >= logLevelRank(minimum);
}

export function parseLogLevel(raw: string | undefined, fallback: LogLevel = 'info'): LogLevel {
    const lower = (raw ?? '').toLowerCase();
    return (ORDER as readonly string[]).includes(lower) ? (lower as LogLevel) : fallback;
}
