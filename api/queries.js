/**
 * AIME-core Queries
 * ==================
 *
 * Collection of queries aiming at retrieving desired data in the neo4j
 * database.
 */
var decypher = require('decypher');

// List of cypher queries
module.exports = decypher(__dirname + '/queries');
