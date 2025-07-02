//region imports
import { IRoom } from "../types/locations/IRoom";
//endregion

export class Print {
    private static DEFAULT_INDENT_COUNT = 1;

    public static NewLine(): string {
        console.log();
        return "\n";
    }

    public static Message(message: string, newLine = true): string {
        if (newLine) {
            message += "\n";
        }
        console.log(message);
        return message;
    }

    public static UnorderedList(list: Array<string>, indentCount = Print.DEFAULT_INDENT_COUNT, bullet = "-"): string {
        if (list.length === 0) {
            return "";
        }
        const joiner = `${"\t".repeat(indentCount)}${bullet}`;
        let message = joiner;
        message += list.join(`\n${joiner}`);
        message += "\n";
        console.log(message);
        return message;
    }

    public static OrderedList(list: Array<string>, indentCount = Print.DEFAULT_INDENT_COUNT): string {
        const message = list.reduce((accum, curr, i) =>
            `${accum}\n${"\t".repeat(indentCount)}${i + 1}. ${curr}`, "");
        console.log(message);
        return message;
    }
}
