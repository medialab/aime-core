/**
 * AIME-core markdown processing
 * ==============================
 *
 * Computing links between major entities and processing them so that we can
 * generate proper markdown.
 */
var _ = require('lodash'),
    tokenizer = require('../../tokenizer.js');

// NOTE: batch.delete(node, true) --> exit relationships

// NOTE: add a markdown property

module.exports = function(neo4j) {

  // NOTE: adjust query at end of debugging process
  return function(next) {
    neo4j.db.query('MATCH (source)-[edge:CITES]->(target) WHERE has(source.italics) RETURN {source: source, outlinks: collect({edge: edge, target: target})} LIMIT 15', function(err, groups) {
      if (err) return next(err);

      // Iterating on each source element
      groups.forEach(function(group) {
        var node = group.source,
            initialText = node.text;

        // Computing splitPoints
        var splitPoints = [],
            sentenceItems = [];

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

        // Vocabulary targets
        _(group.outlinks)
          .values()
          .filter({target: {type: 'vocabulary'}})
          .forEach(function(outlink) {
            var edge = outlink.edge,
                target = outlink.target;

            splitPoints.push({
              type: target.type,
              position: 'start',
              index: edge.properties.start
            });

            splitPoints.push({
              type: target.type,
              position: 'stop',
              index: edge.properties.stop
            });
          });

        // Document targets (no contibutions for the time being)
        _(group.outlinks)
          .values()
          .filter({target: {type: 'document', original: true}})
          .forEach(function(outlink) {
            sentenceItems.push({
              start: outlink.edge.properties.start,
              stop: outlink.edge.properties.stop,
              id: outlink.target.slug_id
            });
          });

        // TODO: bookmarks

        // Reorganization
        splitPoints = _(splitPoints)
          .sortBy(['index', 'type'])
          .value();

        sentenceItems = _(sentenceItems)
          .sortBy(['start', 'id'])
          .value();

        // Computing sentences
        var markdown = '',
            sentences = tokenizer(initialText);

        console.log(sentences.join('\n\n'));

        // console.log(node.id)
        // console.log(splitPoints);
        // console.log(sentenceItems);
        console.log('---------------\n---------------\n---------------')
      });

      console.log('Computing markdown...');
      next();
    });
  };
};

