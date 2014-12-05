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
    $scope.labels = Neo4jFactory.labels();


    $scope.visualise = function(label) {
      $log.info('@CoreCtrl.visualise', label);

      $scope.network = {
        nodes:[],
        edges:[]
      };
    };
  });
