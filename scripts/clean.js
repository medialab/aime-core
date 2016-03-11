var db =  require('../api/connection.js'),
    queries = require('../api/queries.js').clean,
    async = require('async'),
    helpers = require('../api/helpers.js');


async.series([
  async.apply(db.query, queries.biblibId),
  async.apply(db.query, queries.rmDuplicateDescribes),
  async.apply(db.query, queries.lastupdateLegacy, {timestamp:helpers.timestamp()})
], function(err){
  if(err) console.log(err)
  else console.log('clean was successful !')
})
