/**
 * AIME-core fix images extensions scripts
 * ========================================
 *
 * Simple script aiming at fixing missing extensions in the uploaded images
 * file system.
 */
var fs = require('fs'),
    db = require('../api/connection.js'),
    path = require('../config.json').api.resources,
    _ = require('lodash');

function doesFileExist(path) {
  return fs.existsSync(path);
}

// Fecthing images
db.query('MATCH (i:Media {kind: "image", internal: true}) RETURN i', function(err, images) {
  if (err) return console.error(err);

  _(images)
    .forEach(function(image) {
      var folder = image.filename.split('.')[0];

      image.path = path + '/images/uploaded/' + folder;
      image.exists = doesFileExist(image.path + '/original-' + image.filename);
    })
    .filter({exists: false})
    .forEach(function(image) {
      var dir = fs.readdirSync(image.path),
          ext = image.mime.split('/')[1];

      dir.forEach(function(file) {
        var newPath = image.path + '/' + file + ext;

        fs.renameSync(image.path + '/' + file, newPath);
      });
    })
    .value();
});
