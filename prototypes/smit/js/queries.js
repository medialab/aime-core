;(function(undefined) {

  /**
   * Smit queries
   * =============
   *
   * Compilation of Cypher queries for the prototype.
   */

  var cypherQueries = {
    nodesByLabel: function(label) {
      return 'MATCH (n:`' + label + '`) WITH n LIMIT 25 MATCH (n)-[r]-(n1) RETURN n,r,n1;';
    }
  };

  // Exporting
  this.cypherQueries = cypherQueries;
}).call(this);
