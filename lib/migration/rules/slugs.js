/**
 * AIME-core migration slugs
 * ==========================
 *
 * Creating slugs for the necessary entities in the neo4j databases.
 *
 * Note: stocking only an incremental id per entity type in the db rather than
 * a full string.
 */
var _ = require('lodash');

module.exports = function(neo4j) {

  return function(next) {
    neo4j.db.query('MATCH (n) WHERE n:Document OR n:Vocabulary OR n:Media OR n:Subheading OR n:Reference RETURN n;', function(err, nodes) {
      if (err) return next(err);

      var batch = neo4j.db.batch();

      function createSlugs(type) {
        var elements = _.filter(nodes, {type: type}).forEach(function(e, i) {
          e.slug_id = i;
          batch.save(e);
        });
      }

      ['document', 'vocabulary', 'reference', 'media', 'subheading'].forEach(createSlugs);

      console.log('Creating slugs...');
      batch.commit(next);
    });
  };
};
