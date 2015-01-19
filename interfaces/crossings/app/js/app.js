'use strict';


// Declare app level module which depends on filters, and services
angular.module('myApp', [
  // 'ui.utils',
  'ngRoute',
  'ngSanitize',
  //'ngCookies',
  //'monospaced.mousewheel',
  //'angular-inview',
  'myApp.filters',
  'myApp.services',
  'myApp.directives',
  'myApp.controllers'
])
  
  .factory("settings", function(){
    return {
      sharedinfo: "nothing"
    };
  })

  .config(['$routeProvider','$httpProvider', function($routeProvider,$httpProvider) {

    $httpProvider.defaults.withCredentials = true;

    //$routeProvider.when('/auth', {templateUrl: 'partials/auth.html', controller: 'AuthCtrl', requireAuthentication: true});
    
    $routeProvider.when('/:lang/:wantedmodecross', {
      templateUrl: 'partials/read.html',
      reloadOnSearch: false
    });
    
    $routeProvider.when('/:lang', {
      redirectTo: function(routeParams,path,search) {
        return '/'+routeParams.lang+'/tec-fic#tutorial';
      }
    });

    $routeProvider.otherwise({redirectTo: function(routeParams,path,search){return '/en/tec-fic#tutorial';} });
  }]);
