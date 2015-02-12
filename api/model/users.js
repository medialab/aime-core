/**
 * AIME-core Users Model
 * ======================
 *
 */
var db = require('../connection.js'),
    queries = require('../queries.js').user,
    hash = require('../../lib/encryption.js').hash,
    _ = require('lodash');

module.exports = {
  authenticate: function(email, password, callback) {
    var keep = [
      'username',
      'email',
      'name',
      'surname',
      'id'
    ];

    db.query(queries.login, {email: email, hash: hash(password), active: true}, function(err, results) {
      if (err) return callback(err);

      return callback(
        null,
        results.length ? _.pick(results[0], keep) : null
      );
    });
  },
  create: function(params, callback) {

  }
};
