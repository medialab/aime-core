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
module.exports = transport;
