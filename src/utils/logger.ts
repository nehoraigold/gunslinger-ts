// @ts-ignore
import chalk, { ChalkChain } from 'chalk';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_ORDER: LogLevel[] = ['debug', 'info', 'warn', 'error'];

function levelRank(level: LogLevel): number {
    return LEVEL_ORDER.indexOf(level);
}

function parseLevel(raw: string | undefined): LogLevel {
    const lower = (raw ?? '').toLowerCase();
    return (LEVEL_ORDER.includes(lower as LogLevel) ? lower : 'info') as LogLevel;
}

let currentLevel: LogLevel = parseLevel(process.env.LOG_LEVEL);

export function setLogLevel(level: LogLevel): void {
    currentLevel = level;
}

export function getLogLevel(): LogLevel {
    return currentLevel;
}

class ConsoleLogger {
    constructor(private id: string) {}

    debug(...message: any[]) {
        if (levelRank(currentLevel) <= levelRank('debug')) {
            this.print('debug', chalk.dim, ...message);
        }
    }

    info(...message: any[]) {
        if (levelRank(currentLevel) <= levelRank('info')) {
            this.print('info', chalk.cyan, ...message);
        }
    }

    warn(...message: any[]) {
        if (levelRank(currentLevel) <= levelRank('warn')) {
            this.print('warn', chalk.yellow, ...message);
        }
    }

    error(...message: any[]) {
        if (levelRank(currentLevel) <= levelRank('error')) {
            this.print('error', chalk.red, ...message);
        }
    }

    private print(func: 'debug' | 'info' | 'warn' | 'error', color: ChalkChain, ...message: any[]) {
        const logFunc = console[func];
        if (!logFunc || typeof logFunc !== 'function') {
            return;
        }
        const log = this.prep(func, color, ...message);
        logFunc(log);
    }

    private prep(func: string, color: ChalkChain, ...message: any[]): string {
        return color(`${new Date().toISOString()} [${func.toUpperCase()}] ${this.id} | ${message.join(' ')}`);
    }
}

export const getLogger = (id: string) => new ConsoleLogger(id);
