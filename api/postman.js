/**
 * AIME-core Postman
 * ==================
 *
 * Abstraction aiming at sending mails.
 */
var nodemailer = require('nodemailer'),
    smtp = require('nodemailer-smtp-transport'),
    config = require('../config.json').mail,
    inquiryHost = require('../config.json').interfaces.inquiry

// Creating transport
var transport = nodemailer.createTransport(smtp(config));

// Templates
var templates = {
  fr: {
    registrationSubject: '[Enquête sur les Modes d\'Existence] Confirmation d\'inscription',
    registrationBody: 'Nous avons bien enregistré votre demande de création de compte sur ModesOfExistence.org.\nVeuillez cliquer sur le lien suivant pour valider votre inscription : <%= host %>/?activate=true&token=<%= token %>\n\nBien cordialement,\n\nBruno Latour et toute l\'équipe d\'Enquête sur les Modes d\'Existence.'
  },
  en: {
    registrationSubject: '[AIME] Registration confirmation',
    registrationBody: 'Your request has been taken into account on ModesOfExistence.org.\nPlease click on the following link to validate the creation of your account : <%= host %>/?activate=true&token=<%= token %>\n\nKind regards,\n\nBruno Latour and AIME staff.'
  }
};

// Exporting
module.exports = {

  // Sending the registration email
  registration: function(lang, to, token, callback) {
    var render = _.template(templates[lang].registrationBody);

    var options = {
      from: config.from,
      to: to,
      subject: templates[lang].registrationSubject,
      text: render({host: inquiryHost, token: token})
    };

    transport.sendMail(options, callback);
  }
};
