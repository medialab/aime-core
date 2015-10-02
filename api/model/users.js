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
  'avatar',
  'username',
  'email',
  'name',
  'surname',
  'id',
  'token',
  'role'
];

module.exports = {
  authenticate: function(email, password, callback) {

    db.query(queries.login, {email: email, hash: hash(password), active: true}, function(err, results) {
      if (err) return callback(err);

      if (results[0]) {
        return callback(
          null,
          results.length ? _.pick(_.extend(results[0].user, {avatar: (results[0].avatar || {}).filename}), keep) : null
        );
      }
      else {
        return callback(null, null);
      }
    });
  },
  create: function(properties, callback) {
    properties = _.extend({}, properties, {
      active: false,
      role: 'user',
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
    db.query(queries.activate, {token: token}, function(err, results) {
      if (err) return callback(err);

      if (results[0]) {
        return callback(
          null,
          results.length ? _.pick(_.extend(results[0].user, {avatar: (results[0].avatar || {}).filename}), keep) : null
        );
      }
      else {
        return callback(null, null);
      }
    });
  },
  update: function(id, properties, callback) {
    db.query(queries.update, {id: id, properties: properties}, function(err, result) {
      if (err) return callback(err);

      return callback(null, result[0]);
    });
  }
};
