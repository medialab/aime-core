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
  create: function(userId, targetId, callback) {
    db.query(queries.create, {user_id: userId, target_id: targetId}, callback);
  },
  destroy: function(userId, targetId, callback) {
    db.query(queries.destroy, {user_id: userId, target_id: targetId}, callback);
  }
};
