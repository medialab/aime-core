/**
 * AIME-core Vocabulary Model
 * ===========================
 *
 */
var abstract = require('./abstract.js'),
    essence = require('essence').init(),
    biblib = require('./biblib.js'),
    cache = require('../cache.js'),
    queries = require('../queries.js').resource,
    storagePath = require('../../config.json').api.resources,
    db = require('../connection.js'),
    _ = require('lodash');

/**
 * Model functions
 */
module.exports = _.merge(abstract(queries), {

  // Creating a resource
  create: function(kind, lang, data, callback) {
    var batch = db.batch();

    // Data
    var mediaData = {
      type: 'media',
      kind: kind,
      slug_id: ++cache.slug_ids.res
    };

    // Specific to kind
    if (kind === 'image') {
      if (data.url) {
        mediaData.internal = false;
        mediaData.url = data.url;
        mediaData.html = '<img src="' + data.url + '" />';
      }
    }

    // Creating node
    var mediaNode = batch.save(mediaData);
    batch.label(mediaNode, 'Media');

    // TODO: adding the reference

    // Committing
    // TODO: retrieve the item
    batch.commit(callback);
  },

  // Updating a resource
  update: function(id, data, callback) {

  }
});
