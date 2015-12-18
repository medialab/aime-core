/**
 * AIME-core Users Model
 * ======================
 *
 */
var db = require('../connection.js'),
    uuid = require('uuid'),
    queries = require('../queries.js').user,
    hash = require('../../lib/encryption.js').hash,
    helpers = require('../helpers.js'),
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
      password: hash(properties.password),
      date: helpers.now()
    });

    for (var k in properties) {
      if (properties[k] === '')
        delete properties[k];
    }

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
  },
  sos: function(email, callback) {
    var token = uuid.v4();

    db.query(queries.sos, {email: email, token: token}, function(err, result) {
      if (err) return callback(err);
      if (!result.length) return callback(null, null);

      return callback(null, token);
    });
  },
  changePassword: function(token, password, callback) {
    db.query(queries.reset, {token: token, hash: hash(password)}, function(err, result) {
      if (err) return callback(err);

      return callback(null, result[0] || null);
    });
  },
  all: function(callback) {
    db.query(queries.all, function(err, results) {
      if (err) return callback(err);
      if (!results.length) return callback(null, null);

      return callback(
        null,
        results.length ? _.map(results, function(result) {
          return _.pick(result, ['id', 'username', 'surname', 'name']);
        }) : null;
      );
    });
  }
};
