/*
 * Rules concerning the migration of bookmarks from the mysql database.
 */
var async = require('async'),
    _ = require('lodash');

module.exports = function(mysql, neo4j) {

  return function(topNext) {
    async.waterfall([
      function cypher(next) {

        // Fetching relevant nodes
        // AND NOT (n)<-[:HAS]-(:Slide)
        neo4j.db.query('MATCH (c:Document)<-[l:CITES]-(pm)-[:HAS]-(:Slide)-[:HAS]-(d:Document)<-[ll:CITES]-(pb:BookItem) return c,l,d,ll,pb;', next);
      },
      function re_route_links(links, next) {
        var batch = neo4j.db.batch();

        deleted_ll = [];
        links.forEach(function(link){

        	batch.relate(link["pb"].id, 'CITES', link["c"].id, {
                start: link["ll"].start,
                stop: link["ll"].end
              });
        	if(deleted_ll.indexOf(link["l"].id)==-1)
        	{
        		batch.rel.delete(link["l"].id);
        		deleted_ll.push(link["l"].id);
        	}

        })

        console.log('Rerouting links...');
        batch.commit(next);
      }
    ], topNext);
  };
};



