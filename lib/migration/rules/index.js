/**
 * AIME-core migration rules
 * ==========================
 *
 * Index of migration rules.
 */

module.exports = function(mysql, neo4j, mongo) {
  return {
    book: (require('./book.js').bind(null, mysql, neo4j))(),
    documents: (require('./documents.js').bind(null, mysql, neo4j))(),
    uploads: (require('./uploads.js').bind(null, mysql, neo4j))(),
    users: (require('./users.js').bind(null, mysql, neo4j))(),
    vocabulary: (require('./vocabulary.js').bind(null, mysql, neo4j))()
  };
};
