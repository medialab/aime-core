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
        var render = function() {
          $log.info('sigma rendering', arguments);
        };
        element.text('ici sigma', scope.data)
        scope.$watch('data', render);
      }
    };
  });