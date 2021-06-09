require("dotenv").config();

const Joi = require("joi");
const { google } = require("googleapis");
const { promisify } = require("util");

const leadFormSchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  email: Joi.string().email().required(),
});

exports.processForm = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const { body } = req;
  try {
    const value = await leadFormSchema.validateAsync(body);
    return res.status(200).send("Valid");
  } catch (err) {
    return res.status(400).send(err);
  }
};
