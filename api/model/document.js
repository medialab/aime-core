/**
 * AIME-core Document Model
 * =========================
 *
 */
var abstract = require('./abstract.js'),
    db = require('../connection.js'),
    helpers = require('../helpers.js'),
    queries = require('../queries.js').document,
    _ = require('lodash');

module.exports = _.merge({}, abstract(queries), {
  create: function(user, lang, title, slides, callback) {
    var batch = db.batch();

    var docNode = batch.save({
      lang: lang,
      type: 'document',
      title: title,
      date: helpers.now(),
      status: 'public',
      source_platform: 'admin',
      original: false
    });
  }
});
