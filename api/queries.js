/**
 * AIME-core Express Queries
 * ==========================
 *
 * Collection of queries aiming at retrieving desired data in the neo4j
 * database.
 */
var config = require('../config.json').dbs.neo4j,
    seraph = require('seraph');

// Launching the seraph
var host = 'http://' + config.host + ':' + config.port,
    db = new seraph(host);

// List of cypher queries
const queries = {
  book: [
    'MATCH (b:Book {lang:{lang}})-[rc:HAS]-(c:Chapter)-[rs:HAS]-(s:Subheading)',
    'RETURN collect(c) AS chapters;'
  ].join('\n')
};

// Functions
module.exports = {
  book: function(lang, callback) {
    db.queryRaw(queries.book, {lang: lang}, callback);
  }
};

/*

MATCH (b:Book)-[rc:HAS]-(c:Chapter)-[rs:HAS]-(s:Subheading)-[rp:HAS]-(p:Paragraph) WHERE b.lang="en"
WITH s, c, p, rs, rc, rp ORDER BY rp.order ASC
WITH c, rs, rc, {subheading: s, paragraphs: collect(p)} AS subheadings ORDER BY rs.order ASC
WITH rc, {chapter: c, subheadings: collect(subheadings)} AS chapters ORDER BY rc.order ASC
RETURN chapters;

*/
