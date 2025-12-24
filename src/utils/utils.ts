//region imports
import * as readline from "readline";
import { Coordinate } from "./coordinate";
import { Print } from "./print";
//endregion

export const coordinateToString = (coordinate: Coordinate): string => {
    return JSON.stringify(coordinate);
};

export const addCoordinates = (...coordinates: Array<Coordinate>): Coordinate => {
    return coordinates.reduce(((sum, point) => {
        return {
            x: sum.x + point.x,
            y: sum.y + point.y
        };
    }));
};

export const getUserInput = (query?: string): Promise<string> => {
    const rl = readline.createInterface({
        input: process.stdin,
    });
    return new Promise((resolve) => {
        if (query) {
            Print.Message(query);
        }
        rl.question("", (answer) => {``
            rl.close();
            resolve(answer);
        });
    });
};

export const formatToHeader = (string: string): string => {
    if (!string) {
        return "";
    }
    const BUFFER_SIZE = 2;
    const HORIZONTAL_BORDER = "-";
    const VERTICAL_BORDER = "|";
    const CORNER_BORDER = "+";

    const horizontal = `${CORNER_BORDER}${HORIZONTAL_BORDER.repeat(BUFFER_SIZE + string.length + BUFFER_SIZE)}${CORNER_BORDER}`;
    const middle = `${VERTICAL_BORDER}${" ".repeat(BUFFER_SIZE)}${string}${" ".repeat(BUFFER_SIZE)}${VERTICAL_BORDER}`;
    return `${horizontal}\n${middle}\n${horizontal}`;
};
