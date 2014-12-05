'use strict';

/**
 * @ngdoc function
 * @name smit.controller:CoreCtrl
 * @description
 * # CoreCtrl
 * Controller of the smit core, handling filters and calls
 */
angular.module('smit')
  .controller('CoreCtrl', function ($scope, $log, Neo4jFactory) {
    $log.debug('CoreCtrl ready', Neo4jFactory);

    // the neo4j globalquery
    $scope.query = "";

    //
    Neo4jFactory.labels(function(res){

      $scope.labels = _.sortBy(res);

      $log.info($scope.labels);
    });

    $scope.visualise = function(label) {
      $log.info('@CoreCtrl.visualise', label);

      // Fetch data
      Neo4jFactory.cypher({query: cypherQueries.nodesByLabel(label)}, function(results) {
        var nodes = results.data.map(function(n) {
          var t = n[0];

          return {
            id: t.metadata.id,
            data: t.data,
            size: 1,
            x: Math.random(),
            y: Math.random(),
            color: 'blue'
          };
        });

        $scope.network = {
          nodes: nodes,
          edges: []
        };
      });
    };
  });
