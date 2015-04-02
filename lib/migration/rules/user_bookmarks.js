/**
 * AIME-core migration user boomarks rule
 * =======================================
 *
 * Rules concerning the migration of user bookmarks from the mysql database.
 */
var async = require('async'),
    _ = require('lodash');

module.exports = function(mysql, neo4j) {

  return function(topNext) {
    async.waterfall([
      function cypher(next) {
        neo4j.db.query('MATCH (n) WHERE n:User OR n:Paragraph RETURN n;', next);
      },
      function relations(entities, next) {
        var batch = neo4j.db.batch();

        var q = [
          'SELECT',
          'a.id AS id,',
          'b.from_model AS model,',
          'b.from_id AS target,',
          'b.from_start_fr AS start_fr,',
          'b.from_stop_fr AS stop_fr,',
          'b.from_start_en AS start_en,',
          'b.from_stop_en AS stop_en,',
          'b.create_user_id AS user,',
          'b.create_time AS date',
          'FROM tbl_contributionItems a',
          'INNER JOIN tbl_bookmarks b ON a.id = b.to_id',
          'WHERE a.type = -1'
        ].join('\n');

        var users = _.filter(entities, {type: 'user'}),
            paragraphs = _.filter(entities, {type: 'paragraph'});

        mysql.query(q, function(err, rows) {
          if (err) return next(err);

          _(rows)
            .filter(function(row) {
              return row.start_fr !== null || row.start_en !== null;
            })
            .forEach(function(row) {
              row.lang = row.start_fr === null ? 'en' : 'fr';
              row.start = row['start_' + row.lang];
              row.stop = row['stop_' + row.lang];
              row.paragraph = _.find(paragraphs, {lang: row.lang, mysql_model: row.model, mysql_id: row.target});
              row.user = _.find(users, {mysql_id: row.user});
            })
            .filter(function(row) {
              return row.paragraph && row.user;
            })
            .forEach(function(row) {
              batch.relate(row.user, 'BOOKMARKED', row.paragraph, {
                start: row.start,
                stop: row.stop,
                date: row.date.split(' ')[0].replace(/-/g, '')
              });
            })
            .value();

          console.log('Saving user bookmarks...');
          batch.commit(next);
        });
      }
    ], topNext);
  };
};
