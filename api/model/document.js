/**
 * AIME-core Document Model
 * =========================
 *
 */
var marked = require('marked'),
    async = require('async'),
    abstract = require('./abstract.js'),
    cache = require('../cache.js'),
    db = require('../connection.js'),
    helpers = require('../helpers.js'),
    stripper = require('../../lib/markdown_stripper.js'),
    queries = require('../queries.js'),
    _ = require('lodash');

/**
 * Constants
 */
var RE_SLIDES = /\n\n[-*_\s]*\n/g,
    RE_RES = /!\[.*?]\((.*?)\)/;

/**
 * Custom markdown parser
 */
function parseSlides(markdown) {
  return _(markdown.split(RE_SLIDES))
    .map(_.trim)
    .map(function(slide) {
      return marked.lexer(slide);
    })
    .map(function(slide) {
      return _(slide)
        .filter({type: 'paragraph'})
        .map(function(item) {
          var m = item.text.match(RE_RES);

          if (!m)
            return {
              type: 'paragraph',
              markdown: item.text
            };
          else
            return {
              type: m[1].slice(0, 3) === 'res' ? 'resource' : 'reference',
              slug: m[1],
              slug_id: +m[1].slice(4),
            };
        })
        .value();
    })
    .value();
}

/**
 * Model functions
 */

var model = _.merge(abstract(queries.document), {
  create: function(user, lang, title, slidesText, callback) {
    var batch = db.batch();

    // Invalidating document cache
    cache[lang].documents = null;

    // Creating the document node
    var docNode = batch.save({
      lang: lang,
      type: 'document',
      title: title,
      date: helpers.now(),
      status: 'public',
      source_platform: 'admin',
      original: false,
      slug_id: ++cache.slug_ids.doc
    });
    batch.label(docNode, 'Document');

    // Linking the user
    batch.relate(docNode, 'CREATED_BY', user.id);

    // Parsing the slides' structure from markdown content
    var slides = parseSlides(slidesText),
        links = _(slides)
          .flatten()
          .filter(function(element) {
            return element.type !== 'paragraph';
          })
          .uniq(function(element) {
            return element.type + '||' + element.slug_id;
          })
          .value();

    async.waterfall([
      function retrieveLinkedItems(next) {
        db.query(
          queries.misc.getMediasAndReferences,
          {
            res_ids: _(links)
              .filter({type: 'resource'})
              .map('slug_id')
              .value(),
            ref_ids: _(links)
              .filter({type: 'reference'})
              .map('slug_id')
              .value()
          },
          next
        );
      },
      function persistDocument(linkedNodes, next) {

        // If there are fewer linked nodes than expected, we break
        if (links.length !== linkedNodes.length)
          return next(new Error('models.document.create: inconsistent links.'));

        // Creating the slides and their elements
        slides.forEach(function(slideElements, slideIndex) {

            // Slide node
            var slideNode = batch.save({
              lang: lang,
              type: 'slide'
            });

            batch.label(slideNode, 'Slide');
            batch.relate(docNode, 'HAS', slideNode, {order: slideIndex});

            // Creating paragraph and linking external elements
            slideElements.forEach(function(element, elementIndex) {

              if (element.type === 'paragraph') {
                var paragraphNode = batch.save({
                  lang: lang,
                  type: 'paragraph',
                  markdown: element.markdown,
                  text: stripper(element.markdown)
                });

                batch.label(paragraphNode, 'Paragraph');
                batch.relate(slideNode, 'HAS', paragraphNode, {order: elementIndex});
              }
              else {
                var linkedNode = _.find(linkedNodes, {
                  slug_id: element.slug_id,
                  type: element.type === 'resource' ? 'media' : 'reference'
                });

                batch.relate(slideNode, 'HAS', linkedNode, {order: elementIndex});
              }
            });
          });

        // Committing
        batch.commit(next);
      }
    ], callback);

    // TODO: format returned data correctly
    // TODO: link to modes and crossings
  }
});

var getAll = model.getAll;

model.getAll = function(lang, params, callback) {
  getAll(lang, params, function(err, doc) {
    if (err) return callback(err);

    var sortedDoc = _.sortByOrder(
      doc,
      [
        'date',
        function(doc) {
          return _.deburr(doc.title)
        }
      ],
      [false, true]
    );

    return callback(null, sortedDoc);
  });
};

module.exports = model;
