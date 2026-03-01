// @ts-ignore
import chalk from 'chalk';

type NarrativeFn = (text: string) => void;
let narrativeFn: NarrativeFn | null = null;

/** Wire the TUI narrative panel. Called once by main.ts after initUI(). */
export function setNarrativeFn(fn: NarrativeFn): void {
    narrativeFn = fn;
}

export class Print {
    public static RoomHeader(name: string): void {
        if (narrativeFn) {
            narrativeFn(`\n{bold}─── ${name} ───{/bold}\n`);
        } else {
            console.log(chalk.bold(`─── ${name} ───`));
        }
    }

    public static NewLine(): string {
        if (narrativeFn) {
            narrativeFn('\n');
        } else {
            console.log();
        }
        return '\n';
    }

    public static Message(message: string, newLine = true): string {
        if (newLine) {
            message += '\n';
        }
        if (narrativeFn) {
            narrativeFn(message);
        } else {
            console.log(message);
        }
        return message;
    }
}
