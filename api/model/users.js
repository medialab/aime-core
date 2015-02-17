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
  create: function(properties, callback) {
    properties = _.extend({}, properties, {
      active: false,
      type: 'user',
      token: uuid.v4(),
      password: hash(properties.password)
    });

    db.query(queries.create, {properties: properties}, function(err, results) {
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
  },
  createResetToken: function(id, callback) {
    db.query(queries.update, {id: id, properties: {reset_token: uuid.v4()}}, function(err, result) {
      if (err) return callback(err);

      return callback(null, (result[0] || {}).reset_token);
    })
  },
  update: function(id, properties, callback) {
    db.query(queries.update, {id: id, properties: properties}, function(err, result) {
      if (err) return callback(err);

      return callback(null, result[0]);
    });
  }
};
