/**
 * AIME-core migration scenarii rule
 * ==================================
 *
 * Rules concerning the migration of scenarii from the mongo database.
 */
var async = require('async'),
    _ = require('lodash');

const ids = {
  doc: 'document',
  voc: 'vocabulary',
  bsc: 'subheading',
  cont: 'contribution'
};

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

module.exports = function(mongo, neo4j) {

  return function(topNext) {
    async.waterfall([
      function(next) {
        async.parallel({
          nodes: function(n) {
            neo4j.db.query('MATCH n WHERE n:Subheading OR n:Vocabulary OR n:Contribution OR n:Document OR n:Crossing OR n:Mode RETURN n;', n);
          },
          scenarii: function(n) {
            mongo.collection('scenars').find({}).toArray(n);
          }
        }, next);
      },
      function(data, next) {
        var batch = neo4j.db.batch();

        data.scenarii.forEach(function(scenario) {

          var scenarioNode = batch.save({
            type: 'scenario',
            lang: scenario.lang,
            status: scenario.status,
            title: scenario.name
          });

          // Linking to related items
          _(scenario.items instanceof Array ? scenario.items : [scenario.items])
            .map(function(e) {
              var s = e.split('_');

              return {
                id: +s[1],
                type: ids[s[0]]
              };
            })
            .forEach(function(e, i) {

              var node = _.find(data.nodes, {
                lang: scenario.lang,
                mysql_id: e.id,
                type: e.type
              });

              if (!node) {
                console.log(e, scenario.items);
                return;
              }

              batch.relate(scenarioNode, 'HAS', node.id, {order: i});
            }).value();

          // Linking to crossing
          var crossingNode = _.find(data.nodes, function(n) {
            return (n.type === 'crossing' || n.type === 'mode') &&
                   n.name === translate(scenario.modecross);
          });

          if (!crossingNode)
            console.log(scenario);

          batch.relate(scenarioNode, 'RELATES_TO', crossingNode.id);
        });

        // TODO: link scenarii to BL
        console.log('Saving scenarii...');
        batch.commit(next);
      },
      function(results, next) {
        neo4j.db.label(
          _(results).filter({type: 'scenario'}).map('id').value(),
          'Scenario',
          next
        );
      }
    ], topNext);
  };
};
