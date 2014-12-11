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
          entities: function(n) {
            neo4j.db.query('MATCH (n:Vocabulary) RETURN n;', n);
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
          var defs = _(data.entities)
            .filter({type: 'vocabulary', title: '[' + mode + ']'})
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
