/**
 * AIME-core migration links rule
 * ===============================
 *
 * Rules concerning the migration of links from the mysql database.
 */
var async = require('async'),
    _ = require('lodash');

module.exports = function(mysql, neo4j) {

  return function(topNext) {
    async.waterfall([
      function cypher(next) {

        // Fetching relevant nodes
        neo4j.db.query('MATCH n WHERE n:Paragraph OR n:Document OR n:Vocabulary RETURN n;', next);
      },
      function relations(entities, next) {
        var batch = neo4j.db.batch();

        // Fetching links in db
        mysql.query('SELECT * FROM tbl_links', function(err, rows) {
          if (err) return next(err);

          // Links coming from the book's paragraphs
          // TODO: if links overlaps, I should only keep the shortest one and
          // delegate the other one to the paragraph
          // NOTE: use a grouBy and a state machine to do that
          // NOTE: nope, use an index
          var fromBook = _.filter(rows, {from_model: 1});

          fromBook.forEach(function(link) {
            var bookNodeFr = _.find(entities, {mysql_id: link.from_id, lang: 'fr'}),
                bookNodeEn = _.find(entities, {mysql_id: link.from_id, lang: 'en'}),
                targetNodeFr = _.find(entities, {mysql_id: link.to_id, lang: 'fr'}),
                targetNodeEn = _.find(entities, {mysql_id: link.to_id, lang: 'en'});

            // French & English
            if (typeof link.from_start_fr === 'number' && bookNodeFr && targetNodeFr)
              batch.relate(bookNodeFr.id, 'REFERS_TO', targetNodeFr.id, {
                start: link.from_start_fr,
                stop: link.from_stop_fr
              });

            if (typeof link.from_start_en === 'number' && bookNodeEn && targetNodeEn)
              batch.relate(bookNodeEn.id, 'REFERS_TO', targetNodeEn.id, {
                start: link.from_start_en,
                stop: link.from_stop_en
              });
          });

          // Links coming from documents
          var fromVocabulary = _.filter(rows, {from_model: 3});

          fromVocabulary.forEach(function(link) {
            var vocabularyFr = _.find(entities, {mysql_id: link.from_id, lang: 'fr'}),
                vocabularyEn = _.find(entities, {mysql_id: link.from_id, lang: 'en'}),
                targetNodeFr = _.find(entities, {mysql_id: link.to_id, lang: 'fr'}),
                targetNodeEn = _.find(entities, {mysql_id: link.to_id, lang: 'en'});

            // French & English
            if (typeof link.from_start_fr === 'number' && vocabularyFr && targetNodeFr)
              batch.relate(vocabularyFr.id, 'REFERS_TO', targetNodeFr.id, {
                start: link.from_start_fr,
                stop: link.from_stop_fr
              });

            if (typeof link.from_start_en === 'number' && vocabularyEn && targetNodeEn)
              batch.relate(vocabularyEn.id, 'REFERS_TO', targetNodeEn.id, {
                start: link.from_start_en,
                stop: link.from_stop_en
              });
          });

          console.log('Saving links...');
          batch.commit(next);
        });
      }
    ], topNext);
  };
};
