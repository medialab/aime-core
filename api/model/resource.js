/**
 * AIME-core Vocabulary Model
 * ===========================
 *
 */
var abstract = require('./abstract.js'),
    async = require('async'),
    cheerio = require('cheerio'),
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
    var batch = db.batch(),
        mediaNode;

    async.waterfall([
      function createMedia(next) {

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
        mediaNode = batch.save(mediaData);
        batch.label(mediaNode, 'Media');

        next();
      },
      function createBiblibReference(next) {
        if (data.reference && types.check(data.reference, 'bibtex'))
          biblib.save(data.reference, function(err, rec_id) {
            if (err) return next(err);

            return biblib.getById(rec_id, next);
          });
        else
          process.nextTick(next.bind(null, null, null));
      },
      function createReference(record, next) {
        var refData = {
          lang: lang,
          type: 'reference',
          slug_id: ++cache.slug_ids.ref
        };

        // Adding the reference
        if (data.reference) {
          if (!record) {
            refData.text = data.reference;
          }
          else {
            refData.biblib_id = record.rec_id;
            refData.html = record.html;
            refData.text = cheerio(record.html).text();
          }

          var refNode = batch.save(refData);
          batch.label(refNode, 'Reference');
          batch.relate(refNode, 'DESCRIBES', mediaNode);
        }

        return batch.commit(next);
      },
      function retrieve(nodes, next) {

        // Retrieving the created item
        model.getByIds([nodes[0].id], function(err, resources) {
          if (err) return callback(err);

          return callback(null, resources[0]);
        });
      }
    ], callback);
  },

  // Updating a resource
  update: function(id, data, callback) {

  }
});

module.exports = model;
