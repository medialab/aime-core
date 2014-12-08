/**
 * AIME-core migration cleanup
 * ============================
 *
 * Cleaning things up after whole migration is complete. Removing the mysql_id
 * attributes on nodes for instance.
 */
var async = require('async'),
    _ = require('lodash');

module.exports = function(neo4j) {

  return function(topNext) {
    async.series({
      cleanMysqlIDs: function(next) {
        neo4j.db.query('MATCH (n) WHERE has(n.mysql_id) REMOVE n.mysql_id', next);
      },
      cleanUserMysqlIDs: function(next) {
        neo4j.db.query('MATCH (n) WHERE has(n.user_mysql_id) REMOVE n.user_mysql_id', next);
      },
      cleanMysqlModel: function(next) {
        neo4j.db.query('MATCH (n) WHERE has(n.mysql_model) REMOVE n.mysql_model', next);
      }
    }, topNext);
  };
};
