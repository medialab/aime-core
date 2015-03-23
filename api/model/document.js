/**
 * AIME-core Document Model
 * =========================
 *
 */
var abstract = require('./abstract.js'),
    queries = require('../queries.js').document;

module.exports = abstract(queries);
