/**
 * AIME-core Users Model
 * ======================
 *
 */
var db = require('../connection.js'),
    uuid = require('uuid'),
    queries = require('../queries.js').user,
    hash = require('../../lib/encryption.js').hash,
    _ = require('lodash');

var keep = [
  'username',
  'email',
  'name',
  'surname',
  'id'
];

module.exports = {
  authenticate: function(email, password, callback) {

    db.query(queries.login, {email: email, hash: hash(password), active: true}, function(err, results) {
      if (err) return callback(err);

      return callback(
        null,
        results.length ? _.pick(results[0], keep) : null
      );
    });
  },
  create: function(params, callback) {
    var params = _.extend({}, params, {
      active: false,
      type: 'user',
      token: uuid.v4(),
      password: hash(params.password)
    });

    db.query(queries.create, {properties: params}, function(err, results) {
      if (err) return callback(err);

      return callback(
        null,
        results.length ? _.pick(results[0], keep) : null
      );
    });
  },
  activate: function(token, callback) {
    db.query(queries.activate, {token: token}, function(err, result) {
      if (err) return callback(err);

      return callback(null, result[0]);
    });
  }
};
