/**
 * AIME-core Bookmark Model
 * =========================
 *
 */
var db = require('../connection.js'),
    queries = require('../queries.js').bookmark,
    _ = require('lodash');

module.exports = {
  get: function(userId, callback) {
    db.rows(queries.get, {user_id: userId}, callback);
  },
  getByModels: function(userId, callback) {
    db.rows(queries.getByModels, {user_id: userId}, function(err, result) {
      if (err) return callback(err);

      return callback(null, result[0]);
    });
  },
  create: function(userId, targetId, callback) {
    db.query(queries.create, {user_id: userId, target_id: targetId}, callback);
  },
  destroy: function(userId, targetId, callback) {
    db.query(queries.destroy, {user_id: userId, target_id: targetId}, callback);
  }
};
