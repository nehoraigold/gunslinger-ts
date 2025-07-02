//region imports
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { readFileSync } = require("fs");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const readline = require("readline");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const process = require("process");
//endregion

const JSON_SPACING = 4;

function getUserInput(query) {
    const rl = readline.createInterface({
        input: process.stdin
    });
    return new Promise((resolve) => {
        rl.question(query ? query : "", (ans) => {
            rl.close();
            resolve(ans);
        });
    });
}

function getJsonFromFile(filepath) {
    return JSON.parse(readFileSync(filepath).toString());
}

module.exports = {
    JSON_SPACING,
    getUserInput,
    getJsonFromFile
};
