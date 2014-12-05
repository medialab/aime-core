'use strict';

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
          container: element[0]
        });

        var render = function() {
          if (!scope.data)
            return;

          $log.info('sigma rendering', arguments);

          // Cleaning graph
          sig.graph.clear().read(scope.data);
          sig.refresh();
        };
        scope.$watch('data', render);
      }
    };
  });
