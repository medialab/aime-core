/**
 * AIME-core Vocabulary Model
 * ===========================
 *
 */
var abstract = require('./abstract.js'),
    queries = require('../queries.js').vocabulary,
    _ = require('lodash');

var model = abstract(queries),
    getAll = model.getAll; 

model.getAll = function(lang, params, callback) {
  getAll(lang, params, function(err, voc) {
    if (err) return callback(err);

    var sortedVoc = voc.sort(function(a, b) {

      var atitle = _.deburr(a.title).replace(/\[/,''),
          btitle = _.deburr(b.title).replace(/\[/,'');

      if (atitle > btitle) return 1;
      if (atitle < btitle) return -1;
      return 0;
    });

    return callback(null, sortedVoc);
  });
};

module.exports = model;