/**
 * AIME-core biblib import script
 * ===============================
 *
 * This scripts retrieves biblib's data and attach it to relevant references.
 */
var neo4j = require('../lib/migration/neo4j.js'),
    biblib = require('../api/model/biblib.js'),
    cheerio = require('cheerio'),
    async = require('async'),
    _ = require('lodash');

async.waterfall([
  function query(next) {
    neo4j.db.query('MATCH (r:Reference) WHERE has(r.biblib_id) RETURN r;', next);
  },
  function retrieve(references, next) {
    var ids = _.map(references, 'biblib_id');

    biblib.getByIds(ids, function(err, docs) {
      if (err) return next(err);
      return next(null, references, docs)
    });
  },
  function update(references, docs, next) {
    var docIndex = _.indexBy(docs, 'rec_id');

    var batch = neo4j.db.batch();

    references.forEach(function(r) {
      var bid = '' + r.biblib_id,
          html = (docIndex[bid] || {}).html;

      if (!html) {
        console.log('No reference found for:', r);
        return;
      }

      r.html = html;
      r.text = cheerio(html).text();

      batch.save(r);
    });

    batch.commit(next);
  }
], function(err) {
  if (err) console.error(err);
  console.log('Done!');
})
