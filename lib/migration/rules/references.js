/**
 * AIME-core migration references rule
 * ====================================
 *
 * Rules concerning the linking of references and quotes to what they are
 * pointing at.
 */
var async = require('async'),
    _ = require('lodash');

module.exports = function(neo4j) {
  return function users(topNext) {

    async.waterfall([
      function fetchContributions(next) {
        neo4j.db.query('MATCH (n:Slide)-[r:HAS]-(e) RETURN n,r,e;', next);
      },
      function users(entities, next) {

        // WIP
        next();
      }
    ], topNext);
  }
};
