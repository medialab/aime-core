/**
 * AIME-core Bookmark Model
 * =========================
 *
 */
var db = require('../connection.js'),
    queries = require('../queries.js').bookmark;

module.exports = {
  create: function(userId, targetId, callback) {
    db.query(queries.create, {user_id: userId, target_id: targetId}, callback);
  },
  destroy: function(userId, targetId, callback) {
    db.query(queries.destroy, {user_id: userId, target_id: targetId}, callback);
  }
};
