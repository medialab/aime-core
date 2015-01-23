/**
 * AIME-core migration links rule
 * ===============================
 *
 * Rules concerning the migration of links from the mysql database.
 * Notes: 0/all 5/modcross 6/bold 7/italic
 */
var async = require('async'),
    _ = require('lodash');

module.exports = function(mysql, neo4j) {

  return function(topNext) {
    async.waterfall([
      function cypher(next) {

        // Fetching relevant nodes
        neo4j.db.query('MATCH n WHERE n:Book OR n:Paragraph OR n:Document OR n:Vocabulary RETURN n;', next);
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
          var droppedCount = 0;

          _(rows)
            .filter(function(row) {

              // Dropping useless autolinks
              return row.type === 0 && row.from_id !== row.to_id;
            })
            .forEach(function(link) {
              var sourceNodeFr = _.find(entities, {mysql_id: link.from_id, lang: 'fr', mysql_model: link.from_model}),
                  sourceNodeEn = _.find(entities, {mysql_id: link.from_id, lang: 'en', mysql_model: link.from_model}),
                  targetNodeFr = _.find(entities, {mysql_id: link.to_id, lang: 'fr', mysql_model: link.to_model}),
                  targetNodeEn = _.find(entities, {mysql_id: link.to_id, lang: 'en', mysql_model: link.to_model});

              if (!sourceNodeFr && !sourceNodeEn)
                droppedCount++;

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

          // Bold and Italic
          // TODO: check bad links
          _(rows)
            .filter(function(link) {
              return link.type === 6 || link.type === 7;
            })
            .map(function(link) {
              var format = {
                id: link.from_id,
                model: link.from_model,
                type: link.type === 6 ? 'italic' : 'bold'
              };

              // French
              if (typeof link.from_stop_fr === 'number' && link.from_start_fr !== link.from_stop_fr)
                format.fr = {start: link.from_start_fr, stop: link.from_stop_fr};

              // English
              if (typeof link.from_stop_en === 'number' && link.from_start_en !== link.from_stop_en)
                format.en = {start: link.from_start_en, stop: link.from_stop_en};

              return format;
            })
            .groupBy('id')
            .forEach(function(formats) {
              var mysql_id = formats[0].id,
                  mysql_model = formats[0].model,
                  frNode = _.find(entities, {mysql_id: mysql_id, lang: 'fr', mysql_model: mysql_model}),
                  enNode = _.find(entities, {mysql_id: mysql_id, lang: 'en', mysql_model: mysql_model});

              if (frNode) {
                _(formats)
                  .filter(function(f) {
                    return f.fr;
                  })
                  .sortBy(function(f) {
                    return -f.fr.start;
                  })
                  .forEach(function(f) {
                    var sep = f.type === 'italic' ? '*' : '**';

                    if (f.fr.start >= frNode.text.length)
                      return;

                    frNode.text = frNode.text.substring(0, f.fr.start) +
                      sep + frNode.text.substring(f.fr.start, f.fr.stop) + sep +
                      frNode.text.substring(f.fr.stop, frNode.text.length);
                  });

                batch.save(frNode);
              }

              if (enNode) {
                _(formats)
                  .filter(function(f) {
                    return f.en;
                  })
                  .sortBy(function(f) {
                    return -f.en.start;
                  })
                  .forEach(function(f) {
                    var sep = f.type === 'italic' ? '*' : '**';

                    if (f.en.start >= enNode.text.length)
                      return;

                    enNode.text = enNode.text.substring(0, f.en.start) +
                      sep + enNode.text.substring(f.en.start, f.en.stop) + sep +
                      enNode.text.substring(f.en.stop, enNode.text.length);
                  });

                batch.save(enNode);
              }
            });

            console.log('Saving links (lost ' + droppedCount+ ' items)...');
            batch.commit(next);
          });
      }
    ], topNext);
  };
};
