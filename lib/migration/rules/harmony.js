/**
 * AIME-core migration harmony
 * ============================
 *
 * Modifying core concepts of the database as a late action.
 */
var _ = require('lodash');

module.exports = function(neo4j) {

  return function(next) {
    neo4j.db.query('MATCH (n) WHERE n:Document OR n:Contribution RETURN n;', function(err, nodes) {
      if (err) return next(err);

      var batch = neo4j.db.batch();

      var documents = _.filter(nodes, {type: 'document'}),
          contributions = _.filter(nodes, {type: 'contribution'});

      // Adding an original property to both documents and contributions
      documents.forEach(function(doc) {
        doc.original = true;
        batch.save(doc);
      });

      contributions.forEach(function(cont) {
        cont.original = false;
        cont.type = 'document';
        batch.save(cont);
      });

      // Committing
      batch.commit(function(err, results) {
        if (err) return next(err);

        neo4j.db.label(
          _(results).filter({original: false}).map('id').value(),
          'Document',
          next
        );
      });
    });
  };
};
