/**
 * AIME-core Document Model
 * =========================
 *
 */
var abstract = require('./abstract.js'),
    cache = require('../cache.js'),
    db = require('../connection.js'),
    helpers = require('../helpers.js'),
    queries = require('../queries.js').document,
    _ = require('lodash');

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
    // TODO...

    // TODO: get raw text from markdown

    // Committing
    // TODO: apply nested helper to retrieved data
    batch.commit(callback);
  }
});
