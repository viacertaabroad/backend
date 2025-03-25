import { google } from "googleapis";
const google_client_id = process.env.GOOGLE_AUTH_CLIENT_ID;
const google_client_secret = process.env.GOOGLE_AUTH_CLIENT_SECRET;

const oauth2client = new google.auth.OAuth2(
  google_client_id,
  google_client_secret,
  "postmessage"
);

export { oauth2client };
