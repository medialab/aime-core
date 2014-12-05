;(function(undefined) {

  /**
   * Smit queries
   * =============
   *
   * Compilation of Cypher queries for the prototype.
   */

  var cypherQueries = {
    nodesByLabel: function(label) {
      return 'MATCH (n:' + label + ') LIMIT 25;';
    }
  };

  // Exporting
  this.cypherQueries = cypherQueries;
}).call(this);
