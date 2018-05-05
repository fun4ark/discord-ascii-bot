const minimist = require('minimist');
const Joi = require('joi');
const figlet = require('figlet');

const fontName = require('../functions/text/fontName');

const parser = argString => minimist(argString, {
  alias: {
    font: 'f',
    kerning: 'k',
    // TODO: make something similar to the fonts because there are spaces
    // and wrapping the arguments in quotes is annoying
    horizontalLayout: ['horizontal', 'hLayout', 'hl', 'h'],
    verticalLayout: ['vertical', 'vLayout', 'vl', 'v']
  },
  string: ['chars'], // TODO: implement chars
  default: {
    font: 'standard',
    kerning: 'default'
  }
});

const validator = args => Joi.validate(args, {
  font: Joi.string(), // TODO: only allow fonts that exist
  kerning: Joi.string().valid('default', 'fitted', 'full'), // NOTE: empty strings are disallowed by default
  horizontalLayout: Joi.string().valid('default', 'full', 'fitted', 'controlled smushing', 'universal smushing'),
  verticalLayout: Joi.string().valid('default', 'full', 'fitted', 'controlled smushing', 'universal smushing'),
  chars: Joi.string()
}, {
  allowUnknown: true // ignore aliases and args._
});

module.exports = (client, message, argString) => {
  const args = parser(argString);
  const { error } = validator(args);
  if (error) {
    message.reply(error.details[0].message);
    return;
  }

  const font = fontName.in(args.font);
  const { kerning, horizontalLayout, verticalLayout } = args;

  figlet(args._, {
    font,
    kerning,
    horizontalLayout,
    verticalLayout
  }, (err, text) => {
    if (err) {
      // TODO: send different error message if the font was not found
      message.reply('An unknown error occurred');
      client.log('error', err);
      return;
    }
    message.channel.send(text, { code: true });
  });
};
