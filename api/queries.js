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

// Defining our own ways to invoke the api
db.cypher = function(query, params, callback) {
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
          resultDataContents: ['row']
        }
      ],
      parameters: params
    }
  );

  db.call(operation, callback);
};

// List of cypher queries
const queries = {
  book: [
    'MATCH (b:Book {lang: "en"})-[rc:HAS]-(c:Chapter)-[rs:HAS]-(s:Subheading)-[rp:HAS]-(p:Paragraph)',
    'WITH s, c, p, rs, rc, rp, {id: id(p), properties: p} AS paragraphs ORDER BY rp.order ASC',
    'WITH c, rs, rc, {subheading: {id: id(s), properties: s}, paragraphs: collect(paragraphs)} AS subheadings ORDER BY rs.order ASC',
    'WITH rc, {chapter: {id: id(c), properties: c}, subheadings: collect(subheadings)} AS chapters ORDER BY rc.order ASC',
    'RETURN chapters;'
  ].join('\n')
};

db.cypher(queries.book, function(err, results) {
  console.log(JSON.stringify(results, null, 2));
});

// Functions
module.exports = {
  book: function(lang, callback) {
    db.queryRaw(queries.book, {lang: lang}, callback);
  }
};
