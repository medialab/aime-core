'use strict';

// sigma.renderers.def = sigma.renderers.canvas;

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
      template: '<div id="tools"><div class="tool"><a class="fa {{playing?\'playing\':\'pausing\'}}" ng-click="togglePlay()" href=""></a></div><div class="tool"><a class="fa fa-plus" ng-click="zoomIn()" href=""></a></div><div class="tool"><a class="fa fa-minus" href="" ng-click="zoomOut()"></a></div><div class="tool"><a class="fa fa-dot-circle-o" href="" ng-click="rescale()"></a></div></div>',
      scope: {
        data: '=',
        togglePlay: '&',
        zoomIn: '&',
        zoomOut: '&',
        rescale: '&'
      },
      link: function postLink(scope, element, attrs) {
        scope.playing = false;

        var sig = new sigma({
          container: element[0],
          settings: {
            // drawLabels: false,
            minNodeSize: 2,
            defaultEdgeColor: '#ccc',
            font: 'NovelMonoPro-Regular',
            singleHover: true
          }
        });

        scope.togglePlay = function() {

          if (scope.playing)
            sig.stopForceAtlas2();
          else
            sig.startForceAtlas2();

          scope.playing = !scope.playing;
          $log.info('sigma.togglePlay', scope.playing);
        };

        scope.zoomIn = function() {
          $log.info('sigma.zoomIn');

          var cam = sig.cameras[0];

          sigma.misc.animation.camera(
            cam,
            { ratio: cam.ratio / 1.5 },
            { duration: 150 }
          );
        };

        scope.zoomOut = function() {
          $log.info('sigma.zoomOut');

          var cam = sig.cameras[0];

          sigma.misc.animation.camera(
            cam,
            { ratio: cam.ratio * 1.5 },
            { duration: 150 }
          );
        };

        scope.rescale = function() {
          $log.info('sigma.rescale');

          var cam = sig.cameras[0];

          sigma.misc.animation.camera(
            cam,
            {x: 0, y: 0, angle: 0, ratio: 1},
            { duration: 150 }
          );
        };

        // Binding click
        sig.bind('clickNode', function(e) {
          scope.$emit('nodeDetail', e.data.node);
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

          // Sizing with degree
          // NOTE: probably a sigma bug here
          sig.graph.nodes().forEach(function(n) {
            n.size = sig.graph.degree(n.id);
          });
          sig.refresh();

          // Layout
          sig.killForceAtlas2();
          scope.playing = true;

          scope.rescale();

          if (sig.graph.nodes().length > 4000)
            sig.configForceAtlas2({barnesHutOptimize: true});
          sig.startForceAtlas2();

          if (!scope.data.edges.length)
            setTimeout(function() {
              sig.stopForceAtlas2();
            }, 200);
        };
        scope.$watch('data', render);
      }
    };
  });
