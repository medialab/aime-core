/**
 * AIME-core neo4j connection
 * ===========================
 *
 * Simple module exposing a connection to the data target's neo4j database.
 */
var neo4j = require('seraph'),
    config = require('../../config.json').dbs.neo4j;

var host = 'http://' + config.host + ':' + config.port;

// Main abstraction
function Neo4j() {

  // Properties
  this.db = new neo4j(host);
}

// Prototype
Neo4j.prototype.truncate = function(callback) {
  var query = [
    'MATCH (n)',
    'WITH n',
    'LIMIT 10000',
    'OPTIONAL MATCH (n)-[r]-()',
    'DELETE n,r',
    'RETURN COUNT(*)'
  ].join(' ');

  this.db.query(query, function(err, result) {
    if (err) return callback(err);
    callback(null, result['COUNT(*)']);
  });
};

// Exporting
module.exports = new Neo4j();
