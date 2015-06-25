/**
 * AIME-core Vocabulary Model
 * ===========================
 *
 */
var abstract = require('./abstract.js'),
    essence = require('essence').init(),
    queries = require('../queries.js').resource,
    db = require('../connection.js'),
    _ = require('lodash');

/**
 * Model functions
 */
module.exports = _.merge(abstract(queries), {

  // Creating a resource
  create: function(lang, kind, data, callback) {
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
