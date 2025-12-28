//region imports
const { readFileSync } = require("fs");
const readline = require("readline");
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
