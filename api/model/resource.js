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
      function checkExternalResource(next) {
        if (kind === 'video')
          essence.extract(data.url, function(err, infos) {
            if (err) return next(err);

            if (infos.type !== 'video')
              return next(new Error('wrong-external-resource-type'));

            return next(null, infos);
          });
        else
          process.nextTick(next.bind(null, null, null));
      },
      function createMedia(infos, next) {

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

        else if (kind === 'pdf') {
          if (data.url) {
            // TODO: ...
          }
          else {
            var hash = uuid.v4().replace(/-/g, ''),
                file = parseDataUrl(data.file);

            mediaData.internal = true;
            mediaData.path = 'admin/' + hash + '.' + file.extension;

            fse.mkdirpSync(storagePath + '/pdfs/admin');

            // Writing file on disk
            fse.writeFileSync(storagePath + '/pdfs/' + mediaData.path, file.buffer);
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

        else if (kind === 'video') {
          mediaData.internal = false;
          mediaData.url = data.url;
          mediaData.html = infos.html;
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
          slug_id: ++cache.slug_ids.ref,
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
            refData.id = record.id;
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
    var mediaData = {
      id: id,
      type: data.editor.type,
      kind: data.editor.kind,
      slug_id: data.editor.slug_id,
      lang: data.editor.lang,
      internal: data.editor.internal
    };

    async.waterfall([
      function updateMedia(next) {
        if (mediaData.kind === 'quote') {
          mediaData.text = data.editor.text;
        } else {
          return callback(new Error('Unknown media kind'));
        }

        db.save(mediaData, function(err, result) {
          if (err) return callback(err);
          return next(null, result);
        });
      },
      function updateReference(resource, next) {
        if (data.editor.reference) {
          var refData = {
            id: data.editor.reference.id,
            lang: data.editor.reference.lang,
            type: data.editor.reference.type,
            slug_id: data.editor.reference.slug_id
          };

          if (refData.record) {
            // TODO: find out how to update biblib's refs...
          } else {
            refData.text = data.editor.reference.text;
            db.save(refData, function(err, result) {
              mediaData.reference = result;
              if (err) return callback(err);
              return callback(null, mediaData);
            });
          }
        }
      }
    ], callback);
  }
});

module.exports = model;
