'use strict';

sigma.renderers.def = sigma.renderers.canvas;

/**
 * @ngdoc directive
 * @name smit.directive:concepts
 * @description
 * # concepts
 */
angular.module('smit')
  .directive('sigma', function($log) {
    return {
      restrict: 'A',
      scope: {
        data: '='
      },
      link: function postLink(scope, element, attrs) {

        var sig = new sigma({
          container: element[0],
          settings: {

          }
        });

        var render = function() {
          if (!scope.data)
            return;

          $log.info('sigma rendering', arguments);

          // Cleaning graph
          sig.graph.clear();

          // Adding nodes
          scope.data.nodes.forEach(function(n) {
            if (!sig.graph.nodes(n.id))
              sig.graph.addNode(n);
          });

          // Adding edges
          scope.data.edges.forEach(function(e) {
            sig.graph.addEdge(e);
          });

          sig.refresh();

          // Layout
          sig.killForceAtlas2();
          sig.startForceAtlas2({slowDown: 10});

          if (!scope.data.edges.length)
            setTimeout(function() {
              sig.stopForceAtlas2();
            }, 200);
        };
        scope.$watch('data', render);
      }
    };
  });
