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
    return $resource('/api/:id', {}, {
      query: {method: 'GET', isArray: false, params: {id: '@id'} },
      remove: {method: 'DELETE', params: {id: '@id'} }
    });
  });