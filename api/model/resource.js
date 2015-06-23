/**
 * AIME-core Vocabulary Model
 * ===========================
 *
 */
var abstract = require('./abstract.js'),
    essence = require('essence').init(),
    queries = require('../queries.js').resource,
    cache = require('../cache.js'),
    db = require('../connection.js'),
    _ = require('lodash');

/**
 * Helpers
 */
function invalidCache(lang) {
  cache[lang].resources = null;
}

/**
 * Model functions
 */
module.exports = _.merge(abstract(queries), {

  // Creating a resource
  create: function(lang, kind, data, callback) {

    // Invalidating cache
    invalidCache(lang);

    var batch = db.batch();

    // Creating media node
    var mediaNode = batch.save({
      type: 'media',
      internal: false,
      kind: kind
    });
    batch.label(mediaNode, 'Media');
  },

  // Updating a resource
  update: function(id, data, callback) {

  }
});
