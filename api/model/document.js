/**
 * AIME-core Document Model
 * =========================
 *
 */
var marked = require('marked'),
    async = require('async'),
    cache = require('../cache.js'),
    abstract = require('./abstract.js'),
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

  // We should always have at least an empty slide
  if (!markdown)
    return [[{type: 'paragraph', markdown: ''}]];

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
 * Sorting function
 */
function sortingFunction(docs) {
  return _.sortByOrder(
    docs,
    [
      'date',
      function(doc) { return _.deburr(doc.title); }
    ],
    [false, true]
  );
}

/**
 * Model functions
 */
var model = _.merge(abstract(queries.document, sortingFunction), {

  // Creating a document
  create: function(author, lang, title, slidesText, callback) {
    var batch = db.batch();

    // Creating the document node
    var docNode = batch.save({
      lang: lang,
      type: 'document',
      title: title,
      date: helpers.now(),
      status: 'private',
      source_platform: 'admin',
      original: false,
      slug_id: ++cache.slug_ids.doc
    });
    batch.label(docNode, 'Document');

    // Linking the author
    batch.relate(docNode, 'CREATED_BY', author.id);

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

        // TODO: link to modes and crossings

        // Committing
        batch.commit(next);
      },
      function retrieveCreatedDocument(results, next) {
        var id = results[0].id;

        model.getByIds([id], function(err, docs) {
          if (err) return next(err);

          return next(null, docs[0]);
        });
      }
    ], callback);
  },

  // Updating an existing document
  update: function(id, author, title, status, slidesText, callback) {
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
      function getAffectedDocument(linkedNodes, next) {

        // If there are fewer linked nodes than expected, we break
        if (links.length !== linkedNodes.length)
          return next(new Error('models.document.update: inconsistent links.'));

        return db.query(queries.document.getForUpdate, {id: id}, function(err, docs) {
          if (err) return next(err);
          if (!docs[0]) return next(new Error('not-found'));

          return next(null, {doc: docs[0], linkedNodes: linkedNodes});
        });
      },
      function updateDocument(data, next) {
        var batch = db.batch(),
            doc = data.doc,
            linkedNodes = data.linkedNodes,
            docNode = {id: doc.id},
            lang = doc.properties.lang;


        // Handling title
        if (title && title !== doc.title) {
          batch.save(docNode, 'title', title);
        }

        // Handling status
        if (status && status !== doc.status) {
          batch.save(docNode, 'status', status);
        }

        // Handling author change
        if (author !== doc.authorId) {
          batch.rel.delete(doc.authorRelId);
          batch.relate(doc.id, 'CREATED_BY', author);
        }

        // TODO: beware of user bookmarks
        // TODO: modes and crossings
        // TODO: the dedicated query here is not needed per se

        // Udpating the slides - a modus operandi
        // We actually need to destroy the document's slides and paragraph
        // while unlinking the proper elements to rebuild them anew.

        // Deleting necessary nodes & edges
        doc.children.forEach(function(slide) {
          batch.delete(slide.id, true);

          slide.children.forEach(function(element) {
            if (element.type === 'paragraph')
              batch.delete(element.id, true);
          });
        });

        // Re-creating items from scratch
        slides.forEach(function(elements, slideIndex) {
          var slideNode = batch.save({
            lang: lang,
            type: 'paragraph'
          });
          batch.label(slideNode, 'Slide');

          batch.relate(docNode, 'HAS', slideNode, {order: slideIndex});

          elements.forEach(function(element, elementIndex) {
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

        return batch.commit(next);
      },
      function retrieveCreatedDocument(results, next) {
        model.getByIds([id], function(err, docs) {
          if (err) return next(err);

          return next(null, docs[0]);
        });
      }
    ], callback);
  },

  // Destroying an existing document
  destroy: function(id, callback) {
    async.waterfall([
      function getAffectedDocument(next) {
        model.getByIds([id], function(err, docs) {
          if (err) return next(err);
          if (!docs[0]) return next(new Error('not-found'));

          return next(null, docs[0]);
        });
      },
      function deleteDocument(doc, next) {
        var batch = db.batch();

        batch.delete(doc.id, true);

        doc.children.forEach(function(slide) {
          batch.delete(slide.id, true);

          slide.children.forEach(function(element) {
            if (element.type === 'paragraph')
              batch.delete(element.id, true);
          });
        });

        batch.commit(function(err) {
          if (err) return next(err);
          return next(null, doc);
        });
      }
    ], callback);
  }
});

module.exports = model;
