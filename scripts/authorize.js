//region imports
const { join } = require("path");
const { existsSync, writeFileSync } = require("fs");
const { google } = require("googleapis");
const { getUserInput, getJsonFromFile, JSON_SPACING } = require("./utils");
//endregion

const SCOPES = ["https://www.googleapis.com/auth/drive.readonly", "https://www.googleapis.com/auth/spreadsheets.readonly"];
const TOKEN_JSON_NAME = "token.json";
const CREDENTIALS_JSON_NAME = "credentials.json";

async function authorize(credentialsDir) {
    const credentialsPath = join(credentialsDir, CREDENTIALS_JSON_NAME);
    if (!existsSync(credentialsPath)) {
        console.error("You do not have a credentials.json file! See https://developers.google.com/workspace/guides/create-credentials");
        return null;
    }
    const credentials = getJsonFromFile(credentialsPath);
    const { client_id, client_secret, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    const tokenPath = join(credentialsDir, TOKEN_JSON_NAME);
    if (!existsSync(tokenPath)) {
        if (!(await createAndStoreToken(oAuth2Client, tokenPath))) {
            return null;
        }
    } else {
        const token = getJsonFromFile(tokenPath);
        oAuth2Client.setCredentials(token);
    }
    console.log("Authorization completed successfully.");
    return oAuth2Client;
}

async function createAndStoreToken(oAuth2Client, tokenPath) {
    const { tokens } = await createNewToken(oAuth2Client);
    if (!tokens) {
        console.log("Unable to create new token.");
        return false;
    }
    if (!storeToken(tokens, tokenPath)) {
        console.log(`Unable to store new token '${tokens}'.`);
        return false;
    }
    oAuth2Client.setCredentials(tokens);
    return true;
}

async function createNewToken(oAuth2Client) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: "offline",
        prompt: "consent",
        scope: SCOPES,
    });
    console.log(`Authorize this app by visiting this url: ${authUrl}`);
    console.log("Enter the code from that page here:");
    const code = await getUserInput();

    try {
        return await oAuth2Client.getToken(code);
    } catch (err) {
        console.error(`Error while trying to retrieve access token: ${err}`);
        return null;
    }
}

function storeToken(token, tokenPath) {
    try {
        writeFileSync(tokenPath, JSON.stringify(token, null, JSON_SPACING));
        console.log(`Authorization token stored to ${tokenPath}`);
        return true;
    } catch (err) {
        console.err(err);
        return false;
    }
}

module.exports = {
    authorize
};
