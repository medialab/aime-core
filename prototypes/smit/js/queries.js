;(function(undefined) {

  /**
   * Smit queries
   * =============
   *
   * Compilation of Cypher queries for the prototype.
   */

  var cypherQueries = {
    nodesByLabel: function(label) {
      return 'MATCH (n:`' + label + '`) WITH n LIMIT 200 MATCH (n)-[r]-(t) RETURN n,r,t;';
    }
  };

  // Exporting
  this.cypherQueries = cypherQueries;
}).call(this);
