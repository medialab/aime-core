/**
 * AIME-core migration modes rule
 * ==============================
 *
 * Rules concerning the migration of modes from the mysql database.
 */
var async = require('async'),
    _ = require('lodash');

var modes = [
  'REP',
  'MET',
  'HAB',
  'TEC',
  'FIC',
  'REF',
  'POL',
  'DRO',
  'REL',
  'ATT',
  'ORG',
  'MOR',
  'RES',
  'PRE',
  'DC'
];

function inverse(m) {
  if (m === 'RES')
    return 'NET';
  else if (m === 'DRO')
    return 'LAW';
  return m;
}

function translate(m) {
  if (m === 'NET')
    return 'RES';
  else if (m === 'LAW')
    return 'DRO';
  return m.replace(/NET-/, 'RES-')
          .replace(/LAW-/, 'DRO-')
          .replace(/-NET/, '-RES')
          .replace(/-LAW/, '-DRO');
}

var crossings = (function() {
  return _(modes)
    .map(function(mode) {
      var c = [],
          i,
          l;

      for (i = modes.indexOf(mode) + 1, l = modes.length; i < l; i++)
        c.push(mode + '-' + modes[i]);

      return c;
    })
    .flatten()
    .value();
})();

module.exports = function(mongo, neo4j) {
  return function(topNext) {
    async.waterfall([
      function fetchData(next) {

        async.series({
          nodes: function(n) {
            neo4j.db.query('MATCH n WHERE n:Vocabulary OR n:Subheading RETURN n;', n);
          },
          documents: function(n) {
            mongo.collection('books').find({}).toArray(n);
          }
        }, next);
      },
      function saveModes(data, next) {
        var batch = neo4j.db.batch();

        // A node per mode
        var modeNodes = {};
        modes.forEach(function(mode) {
          modeNodes[mode] = batch.save({
            type: 'mode',
            name: mode
          });

          // Link to their vocs
          var defs = _(data.nodes)
            .filter(function(node) {
              return node.type === 'vocabulary' &&
                     (node.title === '[' + mode + ']' || node.title === '[' + inverse(mode) + ']');
            })
            .take(2)
            .value();

          if (!defs.length)
            console.log('No voc entry for mode "' + mode + '".');

          defs.forEach(function(def) {
            batch.relate(def.id, 'DEFINES', modeNodes[mode]);
          });
        });

        // A node per crossing
        var crossingNodes = {};
        crossings.forEach(function(crossing) {
          var m = crossing.split('-');

          crossingNodes[crossing] = batch.save({
            type: 'crossing',
            name: crossing
          });

          // Links
          batch.relate(crossingNodes[crossing], 'HAS', modeNodes[m[0]]);
          batch.relate(crossingNodes[crossing], 'HAS', modeNodes[m[1]]);
        });

        // Linking subheadings to modes and crossings
        var subs = _(data.documents)
          .map(function(d) {
            return d.subchapters.map(function(s) {
              return {
                lang: d.lang,
                mysql_id: +s.id.replace(/bsc_/, ''),
                related: s.related || []
              };
            });
          })
          .flatten()
          .filter(function(sub) {
            return sub.related.length;
          })
          .forEach(function(sub) {
            var subNode = _.find(data.nodes, {type: 'subheading', mysql_id: sub.mysql_id, lang: sub.lang});

            var relatedModes = _(sub.related)
              .map(function(r) {
                return r.split('-').map(translate);
              })
              .flatten()
              .uniq()
              .value();

            var relatedCrossings = _(sub.related)
              .filter(function(r) {
                return r.split('-').length > 1;
              })
              .map(translate)
              .uniq()
              .value();

            // Linking related modes
            relatedModes.forEach(function(rm) {
              batch.relate(subNode.id, 'DESCRIBES', modeNodes[rm]);
            });

            // Linking related crossings
            relatedCrossings.forEach(function(rc) {
              batch.relate(subNode.id, 'DESCRIBES', crossingNodes[rc]);
            });
          });

        console.log('Saving modes and crossings...');
        batch.commit(next);
      },
      function labels(results, next) {
        async.parallel({
          modes: function(n) {
            neo4j.db.label(
              _(results).filter({type: 'mode'}).map('id').value(),
              'Mode',
              n
            );
          },
          crossings: function(n) {
            neo4j.db.label(
              _(results).filter({type: 'crossing'}).map('id').value(),
              'Crossing',
              n
            );
          }
        }, next);
      }
    ], topNext);
  };
};
