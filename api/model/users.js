/**
 * AIME-core Users Model
 * ======================
 *
 */
var db = require('../connection.js'),
    queries = require('../queries.js'),
    hash = require('../../lib/encryption.js').hash;

module.exports = {
  authenticate: function(email, password, callback) {
    db.query(queries.user, {email: email, hash: hash(password)}, callback);
  }
};
