#!/usr/local/bin/node
//region imports
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { join } = require("path");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const process = require("process");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { google } = require("googleapis");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { authorize } = require("./authorize");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { spreadsheetId, destinationDir, credentialsDir } = require("../config");
//endregion

const GOOGLE_SHEETS_API_VERSION = "v4";

async function main() {
    try {
        const auth = await authorize(credentialsDir);
        if (!auth) {
            console.error("Authorization failed!");
            process.exit(1);
        }

        const rows = await retrieveSpreadsheet(auth);
        if (!rows) {
            console.error("Could not retrieve spreadsheet!");
            process.exit(1);
        }

        console.log(rows);

    } catch (e) {
        console.error(e);
    }
}

async function retrieveSpreadsheet(auth) {
    try {
        console.log(auth);
        const sheets = google.sheets({ version: GOOGLE_SHEETS_API_VERSION, auth });
        const { data } = await sheets.spreadsheets.get({ spreadsheetId });
        return data.items;
    } catch (e) {
        console.error(e);
        return null;
    }
}

main();
