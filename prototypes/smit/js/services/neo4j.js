'use strict';

/**
 * @ngdoc service
 * @name smit.neo4j
 * @description
 * # concepts
 * Factory in the smit.
 */
angular.module('smit')
  .factory('Neo4jFactory', function($resource) {
    return $resource('http://10.1.239.24:7474/db/data/:path',
      {
        headers: {
          accepts: 'application/json; charset=UTF-8',
          dataType: 'json'
        },
      },
      {
        cypher: {
          method: 'POST',
          params: {
            path: 'cypher'
          }
        },
        labels: {
          isArray: true,
          method: 'GET',
          params: {
            path: 'labels'
          }
        }
      }
    );
  });
