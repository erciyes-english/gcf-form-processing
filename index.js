require("dotenv").config();

const Joi = require("joi");
const { google } = require("googleapis");

const leadFormSchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  email: Joi.string().email().required(),
});

const addGoogleSheet = async (values) => {
  const auth = await google.auth.getClient({
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const api = google.sheets("v4");
  const addValues = api.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: "Sheet1",
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    resource: {
      values: [values],
    },
    auth,
  });
  return addValues;
};

exports.main = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const { body } = req;
  try {
    const value = await leadFormSchema.validateAsync(body);
    const stuff = JSON.stringify(await addGoogleSheet(Object.values(body)));
    return res.status(200).send(stuff);
  } catch (err) {
    return res.status(400).send(err);
  }
};
