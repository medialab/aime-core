var db =  require('../api/connection.js'),
    queries = require('../api/queries.js').clean,
    async = require('async');

async.series([
  async.apply(db.query, queries.biblibId),
  async.apply(db.query, queries.rmDuplicateDescribes)
], function(err){
  if(err) console.log(err)
  else console.log('clean was successful !')
})
