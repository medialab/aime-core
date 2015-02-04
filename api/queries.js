/**
 * AIME-core Queries
 * ==================
 *
 * Collection of queries aiming at retrieving desired data in the neo4j
 * database.
 */
var decypher = require('decypher');

// List of cypher queries
module.exports = decypher({
  book: __dirname + '/queries/book.cypher',
  document: __dirname + '/queries/document.cypher',
  vocabulary: __dirname + '/queries/vocabulary.cypher',
  user: __dirname + '/queries/user.cypher'
});
