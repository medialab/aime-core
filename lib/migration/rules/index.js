/**
 * AIME-core migration rules
 * ==========================
 *
 * Index of migration rules.
 */

module.exports = function(mysql, neo4j, mongo) {
  return {
    indexation: (require('./indexation.js').bind(null, neo4j))(),

    book: (require('./book.js').bind(null, mysql, neo4j))(),
    bookmarks: (require('./bookmarks.js').bind(null, mysql, neo4j))(),
    contributions: (require('./contributions.js').bind(null, mysql, neo4j))(),
    documents: (require('./documents.js').bind(null, mysql, neo4j))(),
    links: (require('./links.js').bind(null, mysql, neo4j))(),
    uploads: (require('./uploads.js').bind(null, mysql, neo4j))(),
    users: (require('./users.js').bind(null, mysql, neo4j))(),
    user_bookmarks: (require('./user_bookmarks.js').bind(null, mysql, neo4j))(),
    vocabulary: (require('./vocabulary.js').bind(null, mysql, neo4j))(),

    modes: (require('./modes.js').bind(null, mongo, neo4j))(),
    scenarii: (require('./scenarii.js').bind(null, mongo, neo4j))(),

    harmony: (require('./harmony.js').bind(null, neo4j))(),
    references: (require('./references.js').bind(null, neo4j))(),
    slugs: (require('./slugs.js').bind(null, neo4j))(),
    markdown: (require('./markdown.js').bind(null, neo4j))(),
    cleanup: (require('./cleanup.js').bind(null, neo4j))()
  };
};
