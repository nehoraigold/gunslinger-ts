import * as readline from 'readline';
import chalk from 'chalk';

import { Print } from './print';

export const getUserInput = (query?: string): Promise<string> => {
    console.log('');
    const rl = readline.createInterface({
        input: process.stdin,
    });
    return new Promise((resolve) => {
        if (query) {
            Print.Message(query);
        }
        rl.question('', (answer) => {
            if (process.stdout.isTTY) {
                readline.moveCursor(process.stdout, 0, -1);

                // Clear that line
                readline.clearLine(process.stdout, 0);

                // Re-print the input in green
                console.log(chalk.cyan(answer));
            }

            rl.close();
            resolve(answer);
        });
    });
};

export const formatToHeader = (string: string): string => {
    if (!string) {
        return '';
    }
    const BUFFER_SIZE = 2;
    const HORIZONTAL_BORDER = '-';
    const VERTICAL_BORDER = '|';
    const CORNER_BORDER = '+';

    const horizontal = `${CORNER_BORDER}${HORIZONTAL_BORDER.repeat(BUFFER_SIZE + string.length + BUFFER_SIZE)}${CORNER_BORDER}`;
    const middle = `${VERTICAL_BORDER}${' '.repeat(BUFFER_SIZE)}${string}${' '.repeat(BUFFER_SIZE)}${VERTICAL_BORDER}`;
    return `${horizontal}\n${middle}\n${horizontal}`;
};
