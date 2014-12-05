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
    $scope.selectedLabel = ""; // current visualised label

    //
    Neo4jFactory.labels(function(res){
      $scope.labels = _.sortBy(res);
      $log.info($scope.labels);
    });

    // print detail inside sidebear
    $scope.$on('nodeDetail', function(e, node){
      $scope.node = angular.extend(node.data, {id: node.id});
      $scope.$apply()
    });


    // Mappings
    var labels = {
      chapter: 'text',
      subheading: 'text'
    };

    var colors = {
      vocabulary:   '#b77f67',
      text:         '#d1f2a5',
      upload:       '',
      slide:        '#60d575',
      user:         '#cc333f', // mattone
      video:        '',
      paragraph:    '#99d9df',
      subheading:   '#00a0b0',
      chapter:      '#004d54',
      document:     '#edc951',
      contribution: '#eb6841',
      reference:    '#6a4a3c'
    };


    $scope.getColor = function(label) {
      return {color: colors[label.toLowerCase()]}
    };


    $scope.visualise = function(label) {
      $log.info('@CoreCtrl.visualise', label);
      $scope.selectedLabel = label;
      // Fetch data
      Neo4jFactory.cypher({query: cypherQueries.nodesByLabel(label)}, function(results) {
        console.log(results);
        var primaryNodes = results.data.map(function(n) {
          var t = n[0];

          return {
            id: t.metadata.id,
            label: t.data.type + ' ' + t.data.lang,
            data: t.data,
            size: 1,
            x: Math.random(),
            y: Math.random(),
            color: colors[t.data.type],
            type: 'border'
          };
        });

        var secondaryNodes = results.data.map(function(n) {
          var t = n[2];

          return {
            id: t.metadata.id,
            label: t.data.type + ' ' + t.data.lang,
            data: t.data,
            size: 1,
            x: Math.random(),
            y: Math.random(),
            color: colors[t.data.type],
            type: 'border'
          };
        });

        var edges = results.data.map(function(e, i) {
          var t = e[1];

          return {
            id: 'e' + i,
            source: e[0].metadata.id,
            target: e[2].metadata.id,
            color: '#ccc'
          };
        });

        $scope.network = {
          nodes: primaryNodes.concat(secondaryNodes),
          edges: edges
        };
      });
    };
  });
