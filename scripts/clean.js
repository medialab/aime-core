/**
 * AIME-core Clean Script
 * =======================
 *
 * This scripts cleans some dirty patterns within the Neo4J database.
 */
var db =  require('../api/connection.js'),
    queries = require('../api/queries.js').clean,
    async = require('async'),
    helpers = require('../api/helpers.js');

async.series([
  async.apply(db.query, queries.biblibId),
  async.apply(db.query, queries.rmDuplicateDescribes),
  async.apply(db.query, queries.lastupdateLegacy, {timestamp: helpers.timestamp()})
], function(err) {
  if (err) return console.log(err)

  console.log('Clean was successful!');
});
