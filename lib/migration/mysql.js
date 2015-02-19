/**
 * AIME-core mysql connection
 * ===========================
 *
 * Simple module exposing a connection to the data source's mysql database and
 * some handy abstractions to deal with the structure of this data.
 */
var mysql = require('mysql'),
    config = require('../../config.json').dbs.mysql,
    _ = require('lodash');

// Connecting to the source database
var connect = function(callback) {

  var connection = mysql.createConnection(_.extend({}, config, {dateStrings: true}));

  connection.connect(function(err) {
    if (err) return callback(err);
    callback(null, connection);
  });
};

// Exporting
module.exports = connect;
