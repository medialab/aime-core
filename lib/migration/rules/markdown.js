/**
 * AIME-core markdown processing
 * ==============================
 *
 * Computing links between major entities and processing them so that we can
 * generate proper markdown.
 */
var _ = require('lodash');

// Helpers
function isLoneReference(entity) {

}

// NOTE: batch.delete(node, true) --> exit relationships

module.exports = function(neo4j) {

  return function(next) {
    neo4j.db.query('', function(err, nodes) {
      if (err) return next(err);
      next();
    });
  };
};

