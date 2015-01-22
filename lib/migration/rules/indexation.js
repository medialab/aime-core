/**
 * AIME-core migration indexation
 * ===============================
 *
 * Full text indexation for the relevant node properties.
 *
 * Some changes are required in the neo4j configuration (conf/neo4j.properties)
 *   node_auto_indexing=true
 *   node_keys_indexable=title,text,name
 */
var _ = require('lodash');

// TODO: maybe not auto_index here
module.exports = function(neo4j) {

  return function(next) {

    // Auto index operation
    var operation = neo4j.db.operation(
      'index/node',
      'POST',
      {
        name: 'node_auto_index',
        config: {
          type: 'fulltext',
          provider: 'lucene'
        }
      }
    );

    neo4j.db.call(operation, next);
  };
};
