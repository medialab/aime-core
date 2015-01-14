/**
 * AIME-core Encryption
 * =====================
 *
 * Encryption functions used to store passwords.
 */
var crypto = require('crypto'),
    salt = require('../config.json').api.secret;

// Helpers
function md5(s) {
  var h = crypto.createHash('md5');
  h.update(s);
  return h.digest('hex');
}

function rehash(hash) {
  return md5(hash + salt);
}

function hash(password) {
  return rehash(md5(password));
}

// Exporting
module.exports = {
  hash: hash,
  rehash: rehash
};
