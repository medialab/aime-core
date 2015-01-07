/**
 * AIME-core migration slugs
 * ==========================
 *
 * Creating slugs for the necessary entities in the neo4j databases.
 *
 * Note: stocking only an incremental id per entity type in the db rather than
 * a ful
 */

module.exports = function(neo4j) {

  return function(next) {
    next();
  };
};
