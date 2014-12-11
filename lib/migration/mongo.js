/**
 * AIME-core mongo connection
 * ===========================
 *
 * Simple module creating a connection to the required mongo database holding
 * crossings data and scenarii.
 */
var MongoClient = require('mongodb').MongoClient,
    config = require('../../config.json').dbs.mongo;

// Connecting
module.exports = function connect(callback) {
  var url = 'mongodb://' + config.host + ':' + config.port + '/' + config.database;

  MongoClient.connect(url, function(err, db) {
    if (err) return callback(err);
    callback(null, db);
  });
};
