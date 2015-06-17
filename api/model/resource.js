/**
 * AIME-core Vocabulary Model
 * ===========================
 *
 */
var abstract = require('./abstract.js'),
    queries = require('../queries.js').resource;

module.exports = abstract(queries);
