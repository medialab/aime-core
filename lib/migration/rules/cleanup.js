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
      mysqlToLegacyIDs: function(next) {
        neo4j.db.query('MATCH (n) WHERE (n:Document or n:Chapter or n:Subheading or n:Vocabulary) and has(n.mysql_id) SET n.legacy_id=n.mysql_id REMOVE n.mysql_id', next);
      },
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
      cleanAvatarFlag: function(next) {
        neo4j.db.query('MATCH (n) WHERE has(n.avatar) REMOVE n.avatar', next);
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
      },
      modesCrossingsLinks: function(next){
        async.series({
          modesCrossingsVocs:function(n){
            neo4j.db.query('MATCH (v:Vocabulary)-[l:DEFINES]-(mc) where mc:Crossing OR mc:Mode RETURN mc,v', n);
          },
          paragraphs:function(n){
            neo4j.db.query('MATCH (e)-[:HAS]->(p:Paragraph) WHERE (e:BookItem OR e:Vocabulary) AND p.text =~ "(?ius).*\[[a-z]{2,3}(·[a-z]{2,3})?\].*" RETURN p', n);
          }
        },
        function(err,results){
          if (err) return next(err);
          var batch = neo4j.db.batch();

          //build mode and crossing index
          // {fr:{"[REF]":slug_id,...},
          // {en:{"[LAW]":slug_id,...}
          var modesCrossingsVocs = {fr: {}, en: {}};

          results.modesCrossingsVocs.forEach(function(mcv) {
            var v = mcv.v;

            modesCrossingsVocs[v.lang][v.title.toLowerCase()] = v;
          });

          //replace unlinked mode or corssing to their vocabulary
          results.paragraphs.forEach(function(p) {
            var existing_links = p.markdown.match(/voc_\d+/g) || [];

            p.markdown = p.markdown.replace(/([^\[])(\[{1}[a-z]{2,3}(·[a-z]{2,3})?\])([^\]])/gi,
              function(m, prefix, modecrossing, dump, suffix, offset, paragraph) {
                //ajouter le lien

                if (modesCrossingsVocs[p.lang][modecrossing.toLowerCase()]) {
                  if (!~existing_links.indexOf('voc_' + modesCrossingsVocs[p.lang][modecrossing.toLowerCase()].slug_id)) {
                    batch.relate(p.id, 'CITES', modesCrossingsVocs[p.lang][modecrossing.toLowerCase()].id);
                    existing_links.push('voc_' + modesCrossingsVocs[p.lang][modecrossing.toLowerCase()].slug_id);
                  }

                  return prefix + '[' + modecrossing + '](voc_' + modesCrossingsVocs[p.lang][modecrossing.toLowerCase()].slug_id + ')' + suffix;
                }
                else {
                  return prefix + modecrossing + suffix;
                }
              }
            );

            batch.save(p);
          });

          batch.commit(next);
        });
      },
      avatarSize: function(next) {
        neo4j.db.query('MATCH (m:Media)-[:AVATAR_OF]->(:User) SET m.path = REPLACE(m.path, "710x710-", "36x36-");', next);
      },
      cleanUnusedMedia: function(next) {
        neo4j.db.query('MATCH (m:Media) WHERE not((m)--()) DELETE m;', next);
      },
      indexation: function(next) {
        var queries = [
          ':User(active)',
          ':Document(status)',
          ':Chapter(slug_id)',
          ':Subheading(slug_id)',
          ':Document(slug_id)',
          ':Vocabulary(slug_id)',
          ':Media(slug_id)',
          ':Reference(slug_id)'
        ].map(function(q) {
          return function(n) {
            return neo4j.db.query('CREATE INDEX ON ' + q, n);
          }
        });

        async.series(queries, next);
      }
    }, topNext);
  };
};
