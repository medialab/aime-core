/**
 * AIME-core migration cleanup
 * ============================
 *
 * Cleaning things up after whole migration is complete. Removing the mysql_id
 * attributes on nodes for instance.
 */
var async = require('async'),
    _ = require('lodash');

module.exports = function(neo4j) {

  return function(topNext) {

    console.log('Cleaning up...');
    async.series({
      cleanMysqlIDs: function(next) {
        neo4j.db.query('MATCH (n) WHERE has(n.mysql_id) REMOVE n.mysql_id', next);
      },
      cleanUserMysqlIDs: function(next) {
        neo4j.db.query('MATCH (n) WHERE has(n.user_mysql_id) REMOVE n.user_mysql_id', next);
      },
      cleanMysqlModel: function(next) {
        neo4j.db.query('MATCH (n) WHERE has(n.mysql_model) REMOVE n.mysql_model', next);
      },
      cleanItalics: function(next) {
        neo4j.db.query('MATCH (n) WHERE has(n.italics) REMOVE n.italics', next);
      },
      cleanStarts: function(next) {
        neo4j.db.query('MATCH ()-[r:CITES]-() WHERE has(r.start) REMOVE r.start', next);
      },
      cleanStops: function(next) {
        neo4j.db.query('MATCH ()-[r:CITES]-() WHERE has(r.stop) REMOVE r.stop', next);
      },
      copyMarkdown: function(next) {
        neo4j.db.query('MATCH (p:Paragraph) WHERE not(has(p.markdown)) SET p.markdown = p.text RETURN p;', next);
      },
      cleanText: function(next) {
        neo4j.db.query('MATCH (n) WHERE has(n.text) RETURN n;', function(err, nodes) {
          if (err) return next(err);

          var batch = neo4j.db.batch();

          // Replacing nonsensical whitespaces
          nodes.forEach(function(n) {
            n.text = n.text.replace(/[ ‬ ]+/g, ' ');
            if (n.markdown)
              n.markdown = n.markdown.replace(/[ ‬ ]+/g, ' ');
            batch.save(n);
          });

          batch.commit(next);
        });
      },
      BLContributions: function(next) {
        var query = [
          'MATCH (bl:User {email: "bruno.latour@sciences-po.fr"})',
          'MATCH (c:Contribution)',
          'WHERE not((c)--(:User))',
          'CREATE (c)-[r:CREATED_BY]->(bl)',
          'RETURN r;'
        ].join('\n');

        neo4j.db.query(query, next);
      },
      emailConstraints: function(next) {
        neo4j.db.query('CREATE CONSTRAINT ON (u:User) ASSERT u.email IS UNIQUE', next);
      },
      cleanTabulations: function(next) {
        neo4j.db.query('MATCH (p:Paragraph) RETURN p', function(err, paragraphs) {
          if (err) return next(err);

          var batch = neo4j.db.batch();

          paragraphs.forEach(function(p) {
            p.text = p.text.replace(/\t/g, '');
            p.markdown = p.markdown.replace(/\t/g, '');
            batch.save(p);
          });

          batch.commit(next);
        });
      }
    }, topNext);
  };
};
