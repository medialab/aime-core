/**
 * AIME-core Vocabulary Model
 * ===========================
 *
 */
var abstract = require('./abstract.js'),
    queries = require('../queries.js').vocabulary,
    _ = require('lodash');

function sortingFunction(vocs) {
  return vocs.sort(function(a, b) {
    var atitle = _.deburr(a.title).replace(/\[/, ''),
        btitle = _.deburr(b.title).replace(/\[/, '');

    if (atitle > btitle) return 1;
    if (atitle < btitle) return -1;
    return 0;
  });
}

module.exports = abstract(queries, sortingFunction);
