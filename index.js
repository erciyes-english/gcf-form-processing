require("dotenv").config();

const Joi = require("joi");
const { google } = require("googleapis");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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
    await sgMail.send({
      to: process.env.MAIL_TO,
      replyTo: process.env.MAIL_REPLYTO,
      from: {
        email: "no-reply@erciyesenglish.com",
        name: "Erciyes English",
      },
      subject: "New Lead",
      text: `First Name: ${body.firstName} | Last Name: ${body.lastName} | Email: ${body.email}`,
      html: `
      <div>
        <p>First Name: ${body.firstName}</p>
        <p>Last Name: ${body.lastName}</p>
        <p>Email: ${body.email}</p>
      </div>`,
    });
    return res.status(200).send(stuff);
  } catch (err) {
    return res.status(400).send(err);
  }
};
