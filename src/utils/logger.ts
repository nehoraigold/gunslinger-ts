import chalk from 'chalk';

export type LogLevel = 'debug' | 'error' | 'off';

let logLevel: LogLevel = 'off';

export namespace Logger {
    export const initialize = (config: any): void => {
        logLevel = config?.logLevel ?? 'off';
    };

    export const debug = (...message: string[]): void => {
        if (logLevel !== 'debug') {
            return;
        }
        // eslint-disable-next-line no-console
        console.debug(chalk.dim(...message));
    };

    export const error = (...message: string[]): void => {
        if (logLevel === 'off') {
            return;
        }
        // eslint-disable-next-line no-console
        console.error(chalk.red(...message));
    };

    export const info = (...message: string[]): void => {
        if (logLevel === 'off') {
            return;
        }
        // eslint-disable-next-line no-console
        console.log(chalk.white(...message));
    };
}
