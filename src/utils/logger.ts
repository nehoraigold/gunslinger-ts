// @ts-ignore
import chalk, { ChalkChain } from 'chalk';

class ConsoleLogger {
    constructor(private id: string) {}

    debug(...message: any[]) {
        this.print('debug', chalk.dim, ...message);
    }

    info(...message: any[]) {
        this.print('info', chalk.cyan, ...message);
    }

    warn(...message: any[]) {
        this.print('warn', chalk.yellow, ...message);
    }

    error(...message: any[]) {
        this.print('error', chalk.red, ...message);
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
