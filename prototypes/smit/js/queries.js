;(function(undefined) {

  /**
   * Smit queries
   * =============
   *
   * Compilation of Cypher queries for the prototype.
   */

  var cypherQueries = {
    nodesByLabel: function(label) {
      return 'MATCH (n:' + label + ') RETURN n LIMIT 25;';
    }
  };

  // Exporting
  this.cypherQueries = cypherQueries;
}).call(this);
