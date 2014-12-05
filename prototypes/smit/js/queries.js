;(function(undefined) {

  /**
   * Smit queries
   * =============
   *
   * Compilation of Cypher queries for the prototype.
   */

  var cypherQueries = {
    fetchLabels: 'START n=node(*) RETURN distinct labels(n)'
  };

  // Exporting
  this.cypherQueries = cypherQueries;
}).call(this);
