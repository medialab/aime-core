/**
 * AIME-core migration boomarks rule
 * ===============================
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
        neo4j.db.query('MATCH n WHERE n:Paragraph OR n:Document OR n:Vocabulary OR n:Contribution RETURN n;', next);
      },
      function relations(entities, next) {
        var batch = neo4j.db.batch();

        // Fetching links in db
        mysql.query('SELECT * FROM tbl_bookmarks', function(err, links) {
          if (err) return next(err);

          // Links pointing from contributions to elements (tip: they are inversed)
          links.forEach(function(link) {
            var contributionNodeFr = _.find(entities, {mysql_id: link.to_id, lang: 'fr'}),
                contributionNodeEn = _.find(entities, {mysql_id: link.to_id, lang: 'en'}),
                targetNodeFr = _.find(entities, {mysql_id: link.from_id, lang: 'fr'}),
                targetNodeEn = _.find(entities, {mysql_id: link.from_id, lang: 'en'});

            // French & English
            if (link.from_start_fr && contributionNodeFr && targetNodeFr)
              batch.relate(contributionNodeFr.id, 'REFERS_TO', targetNodeFr.id, {
                start: link.from_start_fr,
                stop: link.from_stop_fr
              });

            if (link.from_start_en && contributionNodeEn && targetNodeEn)
              batch.relate(contributionNodeEn.id, 'REFERS_TO', targetNodeEn.id, {
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