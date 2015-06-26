/**
 * AIME-core Vocabulary Model
 * ===========================
 *
 */
var abstract = require('./abstract.js'),
    essence = require('essence').init(),
    biblib = require('./biblib.js'),
    uuid = require('uuid'),
    cache = require('../cache.js'),
    queries = require('../queries.js').resource,
    types = require('../typology.js'),
    storagePath = require('../../config.json').api.resources,
    db = require('../connection.js'),
    fse = require('fs-extra'),
    _ = require('lodash');

/**
 * Helpers
 */
function parseDataUrl(dataUrl) {
  var matches = dataUrl.slice(0, 50).match(/^(data:.+\/(.+);base64,)/);

  return {
    extension: matches[2],
    buffer: new Buffer(dataUrl.slice(matches[1].length), 'base64')
  }
}

/**
 * Model functions
 */
var model = _.merge(abstract(queries), {

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
      else {
        var hash = uuid.v4().replace(/-/g, ''),
            file = parseDataUrl(data.file);

        mediaData.internal = true;
        mediaData.path = 'admin/' + hash + '.' + file.extension;

        fse.mkdirpSync(storagePath + '/images/admin');

        // Writing file on disk
        fse.writeFileSync(storagePath + '/images/' + mediaData.path, file.buffer);
      }
    }

    else if (kind === 'quote') {
      mediaData.lang = lang;
      mediaData.text = data.text;
      mediaData.internal = true;
    }

    else if (kind === 'link') {
      mediaData.internal = false;
      mediaData.html = '<a href="' + data.url + '" target="_blank">' + (data.title || data.url) + '</a>';
      mediaData.url = data.url;
    }

    // Creating node
    var mediaNode = batch.save(mediaData);
    batch.label(mediaNode, 'Media');

    // Adding the reference
    if (data.reference) {
      var isBiblib = types.check(data.reference, 'bibtex'),
          refData;

      if (!isBiblib) {
        refData = {
          lang: lang,
          type: 'reference',
          text: data.reference,
          slug_id: ++cache.slug_ids.ref
        };
      }

      var refNode = batch.save(refData);
      batch.label(refNode, 'Reference');
      batch.relate(refNode, 'DESCRIBES', mediaNode);
    }

    // Committing
    batch.commit(function(err, nodes) {
      if (err) return callback(err);

      // Retrieving the created item
      model.getByIds([nodes[0].id], function(err, resources) {
        if (err) return callback(err);

        return callback(null, resources[0]);
      });
    });
  },

  // Updating a resource
  update: function(id, data, callback) {

  }
});

module.exports = model;
