/**
 * AIME-core Postman
 * ==================
 *
 * Abstraction aiming at sending mails.
 */
var nodemailer = require('nodemailer'),
    smtp = require('nodemailer-smtp-transport'),
    config = require('../config.json').mail;

// Creating transport
var transport = nodemailer.createTransport(smtp(config));

// Exporting
module.exports = {

  // Sending the registration email
  registration: function(lang, to, callback) {
    var options = {
      from: config.from,
      to: to,
      subject: 'AIME-Test',
      text: 'This is some very useful text.'
    };

    transport.sendMail(options, callback);
  }
};
