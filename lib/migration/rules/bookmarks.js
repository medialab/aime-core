/**
 * AIME-core migration boomarks rule
 * ==================================
 *
 * Rules concerning the migration of bookmarks from the mysql database.
 */
var async = require('async'),
    _ = require('lodash');

module.exports = function(mysql, neo4j) {

  return function(topNext) {
    async.waterfall([
      function cypher(next) {

        // Fetching relevant nodes
        neo4j.db.query('MATCH n WHERE n:Book OR n:Paragraph OR n:Document OR n:Vocabulary OR n:Contribution RETURN n;', next);
      },
      function relations(entities, next) {
        var batch = neo4j.db.batch();

        // Fetching links in db
        mysql.query('SELECT * FROM tbl_bookmarks', function(err, links) {
          if (err) return next(err);

          // Links pointing from contributions to elements (tip: they are inversed)
          links.forEach(function(link) {
            var sourceNodeFr = _.find(entities, {mysql_id: link.from_id, lang: 'fr', mysql_model: link.from_model}),
                sourceNodeEn = _.find(entities, {mysql_id: link.from_id, lang: 'en', mysql_model: link.from_model}),
                targetNodeFr = _.find(entities, {mysql_id: link.to_id, lang: 'fr', mysql_model: link.to_model}),
                targetNodeEn = _.find(entities, {mysql_id: link.to_id, lang: 'en', mysql_model: link.to_model});

            // French & English
            if (typeof link.from_start_fr === 'number' && sourceNodeFr && targetNodeFr)
              batch.relate(sourceNodeFr.id, 'CITES', targetNodeFr.id, {
                start: link.from_start_fr,
                stop: link.from_stop_fr
              });

            if (typeof link.from_start_en === 'number' && sourceNodeEn && targetNodeEn)
              batch.relate(sourceNodeEn.id, 'CITES', targetNodeEn.id, {
                start: link.from_start_en,
                stop: link.from_stop_en
              });
          });

          console.log('Saving bookmarks...');
          batch.commit(next);
        });
      }
    ], topNext);
  };
};
