import { google } from "googleapis";
// import fs from "fs";
// import { fileURLToPath } from "url";
// import { dirname, join } from "path";

// const __dirname = dirname(fileURLToPath(import.meta.url));
// const credentials = JSON.parse(
//   fs.readFileSync(join(__dirname, "imp.json"), "utf-8")
// );

const credentials = {
  type: process.env.GOOGLE_SHEETS_TYPE,
  project_id: process.env.GOOGLE_SHEETS_PROJECT_ID,
  private_key_id: process.env.GOOGLE_SHEETS_PRIVATE_KEY_ID,
  private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, "\n"), // Ensure newlines are correctly interpreted
  client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
  client_id: process.env.GOOGLE_SHEETS_CLIENT_ID,
  auth_uri: process.env.GOOGLE_SHEETS_AUTH_URI,
  token_uri: process.env.GOOGLE_SHEETS_TOKEN_URI,
  auth_provider_x509_cert_url:
    process.env.GOOGLE_SHEETS_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.GOOGLE_SHEETS_CLIENT_X509_CERT_URL,
  universe_domain: process.env.GOOGLE_SHEETS_UNIVERSE_DOMAIN,
};

const sheets = google.sheets({
  version: "v4",
  auth: new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  }),
});

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;

async function addToSheet(sheetName, data, headers) {
  try {
    if (!Array.isArray(data)) throw new Error("Data must be an array.");

    // Check for existing headers only if required
    const checkHeaders = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A3:Z3`,
    });

    if (!checkHeaders.data.values) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${sheetName}!B3`,
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [["S.No.", ...headers]] },
      });
    }
    const newRow = ["", ...data]; // Empty column at start
    // Insert data (append without checking next row for speed)
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!B4`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [newRow] },
    });

    console.log("✅ Data added successfully");
  } catch (error) {
    console.error("❌ Error adding data:", error.message);
  }
}

export { addToSheet };
