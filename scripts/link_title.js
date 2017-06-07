/**
 * AIME-core Link Title Script
 * ============================
 *
 * This script finds every "link" media in the Neo4j database then adds
 * a "title" property to them by reading their html.
 */
var db =  require('../api/connection.js'),
    cheerio = require('cheerio');

var cypher = 'MATCH (m:Media {kind: "link"}) RETURN m;';

var batch = db.batch();

db.query(cypher, function(err, results) {
  if (err)
    return console.error(err);

  console.log('Updating ' + results.length + ' media nodes.');

  results.forEach(function(node) {
    var $ = cheerio.load(node.html);

    var title = $('a').text();

    node.title = title;

    batch.save(node);
  });

  batch.commit(function(err2) {
    if (err2)
      return console.error(err2);

    console.log('Done!');
  });
});
