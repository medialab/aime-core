'use strict';

/* Directives */


angular.module('myApp.directives', [])
	
	.directive('appVersion', ['version', function(version) {
		return function(scope, elm, attrs) {
			elm.text(version);
		};
	}])

  .directive('onFinishRender', function ($timeout) {
	    return {
	        restrict: 'A',
	        link: function (scope, element, attr) {
	        	//console.log("Terminated");
	            if(scope.$last === true) {
	            	//scope.$evalAsync(attr.onFinishRender);
	                $timeout(function () {
	                    scope.$emit(attr.onFinishRender);
	                });
	            }
	        }
	    }
	})

  .directive('scenarii', function ($timeout) {
	    return {
	        restrict: 'C',
	        templateUrl: 'partials/scenarii.html',
	        controller: function ($scope,$element) {
	        	//console.log("doing noting false");
	        },
	    }
	})

	.directive('ngEnter', function () {
	    return function (scope, element, attrs) {
	        element.bind("keydown keypress", function(event) {
	            if(event.which === 13) {
	                scope.$apply(function (){
	                	var q = element.val();
	                    scope.$eval( attrs.ngEnter )(q);
	                });
	                event.preventDefault();
	            }
	        });
	    };
	})

	// .directive('minViewContainer', function() {
	// 	return {
	// 		restrict: 'A',
	// 		//replace: true,
	// 		// scope: {
	// 		// 	hung: '&'
	// 		// },
	// 	};
	// })

	// .directive('minView', function() {
	// 	return {
	// 		restrict: 'A',
	// 		//replace: true,
	// 		// scope: {
	// 		// 	hung: '&'
	// 		// },
	// 		link: function(scope, element, attr) {
	// 			console.log("element: "+element);
	// 		}
	// 	};
	// })

	.directive('draggableimage', function($document) {
		return {
			restrict: 'C',
			link: function(scope, element, attr) {
				//console.log("init draggableimage");

				var startX = 0, startY = 0, x = 0, y = 0;

				element.on('mousedown', function(event) {
					//console.log("image clicked");
					// Prevent default dragging of selected content
					event.preventDefault();
					startX = event.pageX - x;
					startY = event.pageY - y;
					$document.on('mousemove', mousemove);
					$document.on('mouseup', mouseup);
				});
				function mousemove(event) {
					y = event.pageY - startY;
					x = event.pageX - startX;
					var scrollContainer = element.parent().parent();
					//console.log(x,y);
					scrollContainer.scrollTop(-y);
					scrollContainer.scrollLeft(x);
					// element.css({
					// 	top: y + 'px',
					// 	left: x + 'px'
					// });

					// try smooth scrollingTo() ?
					// using:
					// cf https://github.com/durated/angular-scroll/
				};
				function mouseup() {
					$document.unbind('mousemove', mousemove);
					$document.unbind('mouseup', mouseup);
				};
			}
		};
	})

	.directive('matrixcell', ['version','$location', function(version,$location) {
		return {
			restrict: 'C',
			templateUrl: 'partials/matrix_cell.html',
			controller: function($scope,$element) {
				
				$scope.isRelated = function(current) {
					// var modecross = $scope.modecross;
					// if(modecross.indexOf("-")!=-1) { // if cross
					// 	console.log(modecross, $scope.order);
					// 	var sp = modecross.split("-");
					// 	var indA = $scope.order.indexOf(sp[0]);
					// 	var indB = $scope.order.indexOf(sp[1]);

					// 	var sp = current.split("-");
					// 	var iA = $scope.order.indexOf(sp[0]);
					// 	var iB = $scope.order.indexOf(sp[1]);
					// 	return ((iA==indA && iB<=indB) || (iB==indB && iA>=indA));
					// } else
					// 	return false;
				};
			}
		};
	}])

	.directive('mosaiccell', ['version', function(version) {
		return {
			restrict: 'C',
			templateUrl: 'partials/mosaic_cell.html',
			
			link: function (scope, element, attr) {
        	if(scope.$last === true) {
        		// you can do something at the end of the ng-repeat !
        		//console.log("----- LAST ONE !");
        	}
        },

      // we used to loop between thumbnail using following (not used at the moment)

			// controller: function($scope,$element) {

			// 	$scope.thumbloop = 0;
			// 	$scope.c.thumb = $scope.c.thumbnail[0];

			// 	// hover a mosaic cell will loop thumbnails
			// 	$scope.hoverMosaicCell = function(c,hover) {
			// 		if($scope.c.thumbnail.length>1) {
			// 			if(hover && !c.timer) {
			// 				c.timer = setInterval( function() {
			// 					var i = $scope.thumbloop++ % $scope.c.thumbnail.length;
			// 					$scope.c.thumb = $scope.c.thumbnail[i];
			// 					//console.log("looped thumb: "+$scope.c.thumb.type+":"+$scope.c.thumb.content.slice(0,20));
			// 					// $scope seems not to be updated without $apply
			// 					$scope.$apply();
			// 				}, 1000);
			// 				//console.log("launched timer "+c.timer+" length: "+$scope.c.thumbnail.length);
			// 			} else if(hover && c.timer) {
			// 				//console.log("already on");
			// 			} else {
			// 				//console.log("stopping timer:"+c.timer);
			// 				clearInterval(c.timer);
			// 				c.timer = null;
			// 				$scope.c.thumb = $scope.c.thumbnail[0];
			// 			}
			// 		} else {
			// 			//console.log("not launching timer cause only one thumbnail");
			// 		}
			// 	};
			// }

		};
	}])


	.directive("templatededitable", ["$compile", '$http', '$templateCache', '$parse', function ($compile, $http, $templateCache, $parse) {
		return {
			restrict: 'C',
			templateUrl: 'partials/theatre_view.html', // default/starting is view
			// scope: {
			// 	mode: '@',
			// },
			link: function(scope,element,attrs) {

				//console.log("directive init.");
				attrs.$observe('mode', function(m) {
					//console.log("Observed:",m,scope.editingTile,attrs.id);
					loadTemplate(m);
				});

				// scope.$watch( function() {return attrs.mode;}, function(newValue,oldValue) {
				// 	console.log("!!!!!! Watched: ",attrs.mode,oldValue,newValue,scope.editingTile,attrs.cellid);
				// 	if(newValue===oldValue) return; // do nothing at first pass
				// 	loadTemplate(attrs.mode);
				// });

				function loadTemplate(mode) {
					//console.log("loading template:",template);
					$http
						.get('partials/theatre_'+mode+'.html', { cache: $templateCache })
						.success(function(templateContent) {
							element.html($compile(templateContent)(scope));                
						});    
				}

				// first time: view is default
				//loadTemplate('view');

			} 
		}
	}])


  .directive('templatedsimple', function() {
    return {
      restrict: 'C',
			templateUrl: 'partials/theatre_view.html',
    }
	});

 // 	.directive('theatreedit', function() {
 //  	return {
 //    	restrict: 'C',
	// 		templateUrl: 'partials/theatre_edit.html',
 //  	}
	// });
