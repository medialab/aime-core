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
    helpers = require('../helpers.js'),
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
  };
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
        if (kind === 'video') {
          return essence.extract(data.url, function(err, infos) {
            if (err) return next(err);

            if (infos.type !== 'video')
              return next(new Error('wrong-external-resource-type'));

            return next(null, infos);
          });
        }

        return next(null, null);
      },
      function createMedia(infos, next) {

        // Data
        var mediaData = {
          type: 'media',
          kind: kind,
          last_update: helpers.timestamp(),
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
        var biblibId = data.reference;

        if (!biblibId)
          return next(null, null);

        // We check the existence of the reference in the Neo4j database
        return db.query(queries.getReferenceByBiblibId, {id: biblibId}, function(err, rows) {
          if (err) return next(err);

          var referenceNode = rows[0];

          // If the reference node does not exist, we create it
          if (!referenceNode) {
            var referenceData = {
              lang: lang,
              type: 'reference',
              slug_id: ++cache.slug_ids.ref,
              biblib_id: biblibId
            };

            // Fetching data from biblib
            return biblib.getById(biblibId, function(err, record) {
              if (err) return next(err);

              referenceData.html = record.html;
              referenceData.text = cheerio(record.html).text();

              referenceNode = batch.save(referenceData);
              batch.label(referenceNode, 'Reference');

              return next(null, referenceNode);
            });
          }

          // Else we just advance to the next step
          return next(null, referenceNode);
        });
      },
      function commit(referenceNode, next) {
        if (referenceNode)
          batch.relate(referenceNode, 'DESCRIBES', mediaNode);
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
  update: function(id, lang, data, callback) {
    var batch = db.batch();

    return async.waterfall([
      function retrieveMedia(next) {
        db.query(queries.getForUpdate, {id: id}, function(err, rows) {
          if (err) return next(err);
          if (!rows.length) return next(null, null);

          return next(null, rows[0]);
        });
      },
      function updateMedia(row, next) {
        var mediaNode = row.media,
            k;

        batch.save(mediaNode, 'last_update', helpers.timestamp());

        // Diffing the keys present in the payload and the node
        for (k in mediaNode) {
          if (k !== 'reference' && mediaNode[k] !== data[k])
            batch.save(mediaNode, k, data[k]);
        }

        // Should we update the reference?
        if (data.reference && data.reference !== row.referenceId) {
          var biblibId = data.reference;

          if (row.relationId) batch.rel.delete(row.relationId);

          return db.query(queries.getReferenceByBiblibId, {id: biblibId}, function(err, rows) {
            if (err) return next(err);

            var referenceNode = rows[0];

            // If the reference node does not exist, we create it
            if (!referenceNode) {
              var referenceData = {
                lang: lang,
                type: 'reference',
                slug_id: ++cache.slug_ids.ref,
                biblib_id: biblibId
              };

              // Fetching data from biblib
              return biblib.getById(biblibId, function(err, record) {
                if (err) return next(err);

                referenceData.html = record.html;
                referenceData.text = cheerio(record.html).text();

                referenceNode = batch.save(referenceData);
                batch.label(referenceNode, 'Reference');

                return next(null, referenceNode);
              });
            }

            return next(null, referenceNode);
          });
        }

        return next(null, null);
      },
      function linkReference(referenceNode, next) {
        if (referenceNode)
          batch.relate(referenceNode, 'DESCRIBES', id);
        return batch.commit(next);
      },
      function retrieve(nodes, next) {

        // Retrieving the created item
        model.getByIds([id], function(err, resources) {
          if (err) return callback(err);

          return callback(null, resources[0]);
        });
      }
    ], callback);
  },

  // Replicating a biblib resource
  replicate: function(biblibId, callback) {
    var referenceNode;

    return async.waterfall([
      function getReference(next) {
        return db.query(queries.getReferenceByBiblibId, {id: biblibId}, function(err, rows) {
          if (err) return next(err);
          if (!rows.length) return next(new Error('not-found'));

          referenceNode = rows[0];

          return next();
        });
      },
      function fetchBiblibData(next) {
        return biblib.getById(biblibId, next);
      },
      function updateReference(record, next) {
        var batch = db.batch();

        referenceNode.html = record.html;
        referenceNode.text = cheerio(record.html).text();

        batch.save(referenceNode);
        return batch.commit(function(err) {
          if (err) return next(err);
          return next(null, true);
        });
      }
    ], function(err) {
      if (err.message === 'not-found')
        return callback(null, false);
      else if (err)
        return callback(err);

      return callback(null, true);
    });
  }
});

module.exports = model;
