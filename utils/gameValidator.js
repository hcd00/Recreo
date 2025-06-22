const Joi = require("joi");

const gameSchema = Joi.object({
  title: Joi.string().max(50).required(),
  desc: Joi.string().max(200).allow(""),
  location: Joi.string().valid("SF Bay Area", "New York", "Arizona", "Los Angeles", "Chicago").required(),
  category: Joi.string().valid("Soccer", "Basketball", "Running", "Pickleball").required(),
  startTime: Joi.date().required(),
  private: Joi.boolean().truthy('on').falsy('off').default(false),
  maxPlayers: Joi.number().min(1).max(100).default(20),
});
module.exports = gameSchema;