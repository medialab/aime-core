/**
 * AIME-core markdown processing
 * ==============================
 *
 * Computing links between major entities and processing them so that we can
 * generate proper markdown.
 */
var _ = require('lodash');

// NOTE: batch.delete(node, true) --> exit relationships

// NOTE: add a markdown property

module.exports = function(neo4j) {

  // NOTE: adjust query at end of debugging process
  return function(next) {
    neo4j.db.query('MATCH (source)-[edge:CITES]->(target) WHERE has(source.italics) RETURN {source: source, outlinks: collect({edge: edge, target: target})} LIMIT 10', function(err, groups) {
      if (err) return next(err);

      // Iterating on each source element
      groups.forEach(function(group) {
        var node = group.source;

        // Computing splitPoints
        var splitPoints = [];

        // Italics?
        node.italics && node.italics.split('|')
          .map(function(t) {
            var s = t.split(',');
            return {
              start: +s[0],
              stop: +s[1]
            };
          })
          .forEach(function(span) {
            splitPoints.push({
              type: 'italic',
              position: 'start',
              index: span.start
            });

            splitPoints.push({
              type: 'italic',
              position: 'stop',
              index: span.stop
            });
          });

        // Targets
        // TODO: compute overlaps
        // TODO: tokenize sentences
        _.values(group.outlinks).forEach(function(outlink) {
          var edge = outlink.edge,
              target = outlink.target;

          splitPoints.push({
            type: target.type,
            position: 'start',
            index: edge.properties.start,
            info: target.title || target.text
          });

          splitPoints.push({
            type: target.type,
            position: 'stop',
            index: edge.properties.stop
          });
        });

        // Computing markdown
        splitPoints = _(splitPoints)
          .sortBy(['index', 'type'])
          .value();

        console.log(node.id)
        console.log(splitPoints);
        console.log('')
      });

      console.log('Computing markdown...');
      next();
    });
  };
};

