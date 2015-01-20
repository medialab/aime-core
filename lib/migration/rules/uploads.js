/**
 * AIME-core migration uploads rule
 * =================================
 *
 * Rules concerning the migration of uploads from the mysql database.
 */
var async = require('async'),
    _ = require('lodash');

module.exports = function(mysql, neo4j) {

  function saveUploads(type, rows, callback) {
    var batch = neo4j.db.batch();

    rows.forEach(function(image) {
      var node = {
        mysql_id: image.id,
        original: image.originalname,
        filename: image.filename,
        mime: image.mimetype,
        filesize: image.filesize,
        type: 'media',
        kind: 'image',
        source: 'internal'
      };

      if (image.width)
        node.width = image.width;
      if (image.height)
        node.height = image.height;

      batch.save(node);
    });

    console.log('Saving ' + rows.length + ' ' + type + ' files...');
    batch.commit(function(err, results) {
      neo4j.db.label(_.map(results, 'id'), 'Media', callback);
    });
  }

  return function(topNext) {

    async.series({
      self: function(next) {
        mysql.query('SELECT * FROM tbl_uploadsDocumentPicture', function(err, rows) {
          saveUploads('internal', rows, next);
        });
      },
      external: function(next) {
        mysql.query('SELECT * FROM tbl_uploadsUserProfilePicture', function(err, rows) {
          saveUploads('external', rows, next);
        });
      }
    }, topNext);
  };
};
