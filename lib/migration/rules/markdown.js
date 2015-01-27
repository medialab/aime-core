/**
 * AIME-core markdown processing
 * ==============================
 *
 * Computing links between major entities and processing them so that we can
 * generate proper markdown.
 */
var _ = require('lodash'),
    tokenizer = require('../../tokenizer.js'),
    slugs = require('../../../config.json').api.slugs;

// NOTE: batch.delete(node, true) --> exit relationships

// NOTE: parse the sentences to replace the mode/crossings part into full-fledged links

// NOTE: add a markdown property

// Helpers
function slugify(id) {
  return slugs[this] + '_' + id;
}

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
              index: edge.properties.stop,
              id: target.slug_id
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

        // Reorganization
        splitPoints = _(splitPoints)
          .sortBy(['index'])
          .value();

        sentenceItems = _(sentenceItems)
          .sortBy(['start', 'id'])
          .value();

        // Computing sentences
        var markdown = initialText,
            generalOffset = 0,
            sentences = tokenizer(initialText).map(function(sentence) {
              var o = {
                words: sentence
              };
              o.start = initialText.indexOf(sentence);
              o.stop = o.start + sentence.length;
              return o;
            });

        // Group sentence items per sentence
        sentenceItems.reverse().forEach(function(si) {
          var sentence = _.find(sentences, function(s) {
            return si.start >= s.start && si.start <= s.stop;
          });

          si.sentence = sentence;
          si.sentence_idx = sentences.indexOf(sentence);
        });

        // Computing markdown
        var offset = 0;
        _(sentences)
          .forEach(function(sentence, sentence_idx) {
            var items = sentenceItems.filter(function(item) {
              return item.sentence_idx === sentence_idx;
            });

            var initialLength = sentence.words.length;

            var slugged = items.length ?
              '{' + _.map(items, 'id').map(slugify.bind('document')).join(',') + '}' :
              '';

            // Retrieving splitPoints
            var spp = splitPoints.filter(function(s) {
              return s.index >= sentence.start && s.index <= sentence.stop;
            });

            // Applying split-points
            spp.reverse().forEach(function(s) {

              // Italic
              if (s.type === 'italic') {
                var fragment = '*';
                sentence.words = sentence.words.substring(0, s.index - offset) + fragment +
                  sentence.words.substring(s.index - offset, sentence.words.length);
              }
              else {

              }
            });

            // Computing ending
            // NOTE: sometimes, relevant punctuation is not enough
            var ending = '',
                i = -1;
            while (!~ending.search(/[.!?;…]/)) {
              ending = sentence.words.slice(i);
              i--;
            }

            // Applying sentence level items and ending
            sentence.words = sentence.words.slice(0, i + 1) + slugged + ending;

            // Updating offset
            offset += initialLength;
          });

        console.log(_.map(sentences, 'words'));
        console.log('\n');
      });

      console.log('Computing markdown...');
      next();
    });
  };
};

