#!/usr/local/bin/node
const fs = require('fs');
const path = require("path");
const process = require("process");
const { google } = require("googleapis");
const { authorize } = require("./authorize.cjs");
const { spreadsheetId, destinationDir, credentialsDir } = require("../config.local.json");
//endregion

const GOOGLE_SHEETS_API_VERSION = "v4";

async function main() {
    try {
        const auth = await authorize(credentialsDir);
        if (!auth) {
            console.error("Authorization failed!");
            process.exit(1);
        }

        const successful = await downloadSpreadsheet(auth, spreadsheetId);
        if (!successful) {
            console.error("Could not download spreadsheet tabs!");
            process.exit(1);
        }

        console.log("Downloaded successfully!")
    } catch (e) {
        console.error(e);
    }
}

async function downloadSpreadsheet(auth, spreadsheetId) {
    try {
        console.log(`Retrieving spreadsheet with ID ${spreadsheetId}...`);
        const sheets = google.sheets({ version: GOOGLE_SHEETS_API_VERSION, auth });
        const { data } = await sheets.spreadsheets.get({ spreadsheetId });
        const sheetTitles = data.sheets.map((sheet) => sheet.properties.title);
        for (const title of sheetTitles) {
            console.log(`Exporting "${title}"...`);

            const res = await sheets.spreadsheets.values.get({
                spreadsheetId,
                range: title,
                valueRenderOption: "UNFORMATTED_VALUE",
            });

            const rows = res.data.values || [];
            const csv = rowsToCsv(rows);

            const filePath = path.join(destinationDir, `${title}.csv`);
            fs.writeFileSync(filePath, csv, "utf8");
        }
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
}

function rowsToCsv(rows) {
    return rows
        .map(row =>
            row.map(cell => {
                const value = cell ?? "";
                const str = String(value).replace(/"/g, '""');
                return `"${str}"`;
            }).join(",")
        )
        .join("\n");
}

main();
