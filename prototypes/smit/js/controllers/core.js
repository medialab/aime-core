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
    function truncate(txt, size) {
      if (txt.length > size)
        return txt.slice(0, size) + '...';
      else
        return txt;
    }

    var labels = {
      chapter: 'title',
      subheading: 'title',
      document: 'title',
      paragraph: function(n) {
        return truncate(n.text, 30);
      },
      quote: function(n) {
        return truncate(n.text, 30);
      },
      vocabulary: 'title',
      contribution: 'title',
      user: function(n) {
        return n.name + ' ' + n.surname;
      },
      slide: function(n) {
        return 'slide ' + n.lang;
      },
      media: 'kind',
      pdf: 'title',
      reference: function(n) {
        if ('biblib_id' in n)
          return 'biblib ' + n.biblib_id;
        else
          return truncate(n.text, 30);
      },
      video: function(n) {
        return 'vimeo ' + n.identifier;
      },
      mode: 'name',
      crossing: 'name'
    };

    var colors = {
      vocabulary:   '#b77f67',
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
          var t = n[0],
              label = labels[t.data.type];

          return {
            id: t.metadata.id,
            label: label ? (typeof label === 'function' ? label(t.data) : t.data[label]) : t.data.type,
            data: t.data,
            size: 1,
            x: Math.random(),
            y: Math.random(),
            color: colors[t.data.type],
            type: 'border'
          };
        });

        var secondaryNodes = results.data.map(function(n) {
          var t = n[2],
              label = labels[t.data.type];

          return {
            id: t.metadata.id,
            label: label ? (typeof label === 'function' ? label(t.data) : t.data[label]) : t.data.type,
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
