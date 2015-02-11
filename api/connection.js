/**
 * AIME-core Database Connection
 * ==============================
 *
 * App's connection to the Neo4J database and custom helpers.
 */
var config = require('../config.json').dbs.neo4j,
    seraph = require('seraph');

// Launching the seraph
var host = 'http://' + config.host + ':' + config.port,
    db = new seraph(host);

// Helper Forge
function makeHelper(dataContent) {
  return function(query, params, callback) {
    if (!query)
      throw Error('api.connection.' + [dataContent] + ': inexistant query.');

    if (typeof params === 'function') {
      callback = params;
      params = params || {};
    }

    var operation = db.operation(
      'transaction/commit',
      'POST',
      {
        statements: [
          {
            statement: query,
            resultDataContents: [dataContent],
            parameters: params
          }
        ]
      }
    );

    db.call(operation, function(err, response) {
      if (err) return callback(err);

      var error = response.errors[0],
          data = response.results[0].data.map(function(d) {
            return d[dataContent];
          });

      if (error) {
        var e = new Error('rest-error');
        e.original = error;
        return callback(e);
      }

      return callback(null, data);
    });
  };
}

// Defining our own ways to invoke the api
db.rows = makeHelper('row');
db.graph = makeHelper('graph');
db.rest = makeHelper('rest');

module.exports = db;
