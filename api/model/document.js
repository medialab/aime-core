/**
 * AIME-core Document Model
 * =========================
 *
 */
var marked = require('marked'),
    abstract = require('./abstract.js'),
    cache = require('../cache.js'),
    db = require('../connection.js'),
    helpers = require('../helpers.js'),
    stripper = require('../../lib/markdown_stripper.js'),
    queries = require('../queries.js').document,
    _ = require('lodash');

/**
 * Constants
 */
var RE_SLIDES = /\n\n[-*_\s]*\n/g;

/**
 * Custom markdown parser
 */
function splitSlides(markdown) {
  return _(markdown.split(RE_SLIDES))
    .map(_.trim)
    .map(function(slide) {
      return _(slide)
        .filter({type: 'paragraph'})
        .map('text')
        .value();
    })
    .value();
}

/**
 * Model functions
 */
module.exports = _.merge(abstract(queries), {
  create: function(user, lang, title, slides, callback) {
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
    }, 'Document');

    // Linking the user
    batch.relate(docNode, 'CREATED_BY', user.id);

    // Parsing the slides' markdown to create the other nodes
    splitSlides(slides)
      .forEach(function(slide) {
        console.log(slide);
      });

    // TODO: split paragraphs
    // TODO: get raw text from markdown
    // TODO: link to parsed entities

    // Committing
    // TODO: apply nested helper to retrieved data
    // batch.commit(callback);
    callback();
  }
});
