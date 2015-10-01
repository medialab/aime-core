'use strict';

/* Controllers */

angular.module('underscore', [])

	.factory('_', function() {
		return window._; // assumes underscore has already been loaded on the page
	})


angular.module('myApp.controllers', ['underscore','config'])

	// BEWARE
	.config(['$sceProvider', function($sceProvider) {
		$sceProvider.enabled(false);
	}])
	.controller('CrossingsCtrl',
			["$scope","$rootScope","Api","$document","$location","$route","$routeParams","$timeout","_","settings","$sce", //"$cookies","$cookieStore"
			function($scope,$rootScope,Api,$document,$location,$route,$routeParams,$timeout,_,settings,$sce) { //$cookies,$cookieStore

		$scope.conf = settings;
		$scope.showAdmin = false; // by default. may be overriden after that.
		console.log("==================== Page!Reload - domain is: "+$scope.conf.domain);

		window.showAdmin = $scope.showAdmin;

		var analytic = function(page) {
			if(!$scope.isAdmin()) {
				console.log("==== Google Analytics Page: "+page);
				ga('send', 'pageview', {'page': page});
			}
		}
		// watch route changes ?
		// var lastRoute = $route.current;
		// console.log(lastRoute);
		// $scope.$on('$locationChangeSuccess', function(event) {
		// 	console.log("setting route:"+lastRoute);
		// 	//$route.current = lastRoute;
		// });


		// Following is kept just in case we would want to manage auth/credentials within angular/nodejs
		// What we simply do instead at the moment is use the "platformuser" var checked against the old platform to know if user is auth
		$scope.isAdmin = function() {
			return $scope.showAdmin;
		};
		/*
		$scope.message = "please enter your credentials";
		$scope.user = $cookieStore.get('user');
		$scope.email = "aime";

		// followings are for auth in THIS platform (only admin access)
		$scope.isAdmin = function() {
			return $scope.user;
		};

		$scope.authTest = function() {
			console.log("auth: log test status:");
			Api.authTest(function(res){
				console.log(res.data);
			});
		}
		$scope.authLogIn = function() {
			console.log("auth: logging in");
			Api.authLogIn({
				email: 		$scope.email,
				password: 	$scope.password
			}, function(res){
				if(res.data.success) {
					console.log(res.data.user);
					// keeps logged-user in a cookie
					$cookieStore.put('user', res.data.user);
					$scope.user = $cookieStore.get('user');
				}
				console.log(res.data);
			});
		};
		$scope.authLogOut = function() {
			console.log("auth: logging out");
			Api.authLogOut(function(res){
				// remove cookie
				$cookieStore.remove('user');
				$scope.user = null;
			});
		};*/

		///////////////////////////////////////////// get position based on modecross
		$scope.scale = function(c,modeorcross) {

			// scale [minWidth, maxWidth]
			//return $scope.cMin + ($scope.cMax-$scope.cMin)*c / $scope.maxCount[modeorcross];
			// scale [0,1]
			var minScale = 0.3;
			return minScale + (c * (1-minScale) / $scope.maxCount[modeorcross]);
		};
		var arrondi = 3;
		$scope.getPosSizePyramid = function(d) {
			var res = {};
			var modecross = d.name;
			var mode = modecross.indexOf("-")==-1;
			if(mode) {
				res.size = $scope.scale(d.count,"modes");
				res.x = $scope.order.indexOf(modecross);
				res.y = 0;
			} else {
				res.size = $scope.scale(d.count,"cross");
				var m = modecross.split("-");
				var a = $scope.order.indexOf(m[0]);
				var b = $scope.order.indexOf(m[1]);
				res.x = (b+a)/2;
				res.y = -b+a;
			}
			var dec = 40; // is the height of the hexagons
			var bang = {
				name: modecross,
				count: d.count,
				x: (res.x * $scope.matrixW / $scope.order.length).toFixed(arrondi),
				y: (-dec + $scope.matrixW + (res.y * 0.8 * $scope.matrixW / $scope.order.length) ).toFixed(arrondi),
				size: res.size.toFixed(arrondi),
			};
			console.log(bang);
			return bang;
		};
		$scope.getPosSizeTriangle = function(d) {
			var res = {};
			var modecross = d.name;
			var mode = modecross.indexOf("-")==-1;
			if(mode) {
				res.size = $scope.scale(d.count,"modes");
				res.x = 0;
				res.y = $scope.order.indexOf(modecross);
			} else {
				res.size = $scope.scale(d.count,"cross");
				var m = modecross.split("-");
				var a = $scope.order.indexOf(m[0]);
				var b = $scope.order.indexOf(m[1]);
				res.x = b-a;
				res.y = (b+a)/2;
			}
			return {
				count: d.count,
				x: (res.x * $scope.matrixW*0.8 / $scope.order.length).toFixed(arrondi),
				y: (res.y * $scope.matrixW / $scope.order.length).toFixed(arrondi),
				size: res.size.toFixed(arrondi),
			};
		};

		////////////////////////////////////// update matrix size
		$scope.toggleMatrixSize = function(big) {
			$scope.matrixW = big ? 290 : 40;

			$scope.cMin = 5;
			$scope.cMax = $scope.matrixW / $scope.order.length;

			$scope.modes = _.map($scope.modes, function(d){
				d = _.extend(d, $scope.getPosSizeTriangle(d));
				d.type = "mode";
				d.modecross = d.name;
				//console.log(d.size);
				return d;
			});
			$scope.cross = _.map($scope.cross, function(d){
				d = _.extend(d, $scope.getPosSizeTriangle(d));
				d.type = "cross";
				d.modecross = d.name.replace("-","_");
				//console.log(d.size);
				return d;
			});
			$scope.modecrosses = _.union($scope.modes,$scope.cross);
			$scope.legend = _.map($scope.order, function(o,i){
				return {
					// vertical legend
					x: -55,
					y: i * $scope.matrixW / $scope.order.length - 5,
					// horizontal legend (todo)
					//x: i * $scope.matrixW / $scope.order.length,
					//y: $scope.matrixW,
					name: o
				}
			});
		};

		////////////////////////////////////// init fetch AIME config
		$scope.initConfig = function() {
			Api.fetchConfig({
				lang: $scope.lang,
				redirectUrl: $scope.conf.inquiryUrl + '#redirect=' + encodeURIComponent(window.location.href)
			}, function(res){
				console.log("Fetched config: ",res.data);
				$scope.order = res.data.order;
				$scope.modes = res.data.modes;
				$scope.cross = res.data.cross;
				$scope.maxCount = res.data.maxCount;
				//console.log("maxCounts:");
				//console.log($scope.maxCount);
				$scope.toggleMatrixSize(true);

				$scope.showAdmin =
					res.data.platformuser=="admin" ||
					//$location.hash()=="admin" ||
					(settings.adminIfFreeForAll && res.data.platformuser=="freeforall");

				$scope.initAddTilesAhead();
			});
		};

		/////////////////////////////////////////////////////////////
		$scope.goToModecross = function(modecross,closepanel) {
			if(closepanel) $scope.onTriangle = false;

			var samemodecross = $scope.modecross == modecross.replace("_","-");
			$scope.modecross = modecross.replace("_","-");

			console.log("Matrixclicked on: "+$scope.modecross);

			if(samemodecross) {

				console.log("same. doing nothing");

			} else {

				$scope.loading = true;
				setTimeout(function() {
					$location.url("/"+$scope.lang+"/"+$scope.modecross.toLowerCase());
					$scope.$apply();
				}, closepanel ? 800 : 0 ); // if closing panel, let's delay the trigger

			}
		};

		/////////////////////////////////////////////////////////////
		$scope.hoverMatrixCell = function(modecross,hover) {
			var modecross = modecross.replace("_","-");
			//console.log("hover: "+modecross);
			// fade out all legends
			$(".active").removeClass("active");
			$(".related").removeClass("related");
			//$scope.hover = hover ? "hover" : "out";
			//$element.addClass(hover ? "on":"off");
			if(hover) {

				//console.log("on: " + modecross + ":" + $scope.m.count);
				$scope.hovermodecross = modecross;

				var ia = $scope.order.indexOf(modecross.split("-")[0]);
				var ib = $scope.order.indexOf(modecross.split("-")[1]);

				$("#"+modecross).addClass("active");
				_.each(modecross.split("-"), function(m) {
					$("#legend_"+m).addClass("active");
					$("#"+m).addClass("related");
					_.each($scope.order, function(v,k) {
						//console.log(k,v,m);
						if(k>=ia) $("#"+v+"-"+m).addClass("related");
						if(k<=ib) $("#"+m+"-"+v).addClass("related");
					});
				});
			} else {

			}
		};

		/////////////////////////////////////////////////////////////
		$scope.initGrid = function(enableDrag) {
			var withDrag = false;
			if(enableDrag) withDrag = true;
			console.log("Re-Init shapeshift mosaic with drag: "+withDrag);
			$('.mosaic').shapeshift({
				//selector: ".mosaiccell",
				enableDrag: withDrag,
				//enableResize: true,
				//enableTrash: false,
				align: "left",
				//colWidth: 50,
				//columns: null
				//minColumns: 5,
				//autoHeight: true
				//maxHeight: 300,
				//minHeight: 300,
				gutterX: 5,
				gutterY: 5,
				paddingX: 0,
				paddingY: 0,
				// animated: true,
				animateOnInit: true,
				animationSpeed: 350, //225
				animationThreshold: 30,
				//dragClone: false
				//deleteClone: true
				//dragRate: 100
				//dragWhitelist: "*"
				//crossDropWhitelist: "*"
				//cutoffStart: null
				//cutoffEnd: null
				//handle: false

				// cloneClass: "ss-cloned-child"
				// activeClass: "ss-active-child"
				// draggedClass: "ss-dragged-child"
				// placeholderClass: "ss-placeholder-child"
				// originalContainerClass: "ss-original-container"
				// currentContainerClass: "ss-current-container"
				// previousContainerClass: "ss-previous-container"
			});

			// remove loading spinner
			$scope.gridLoaded = true;
		};

		/////////////////////////////////////////////////////////////
		$scope.toggleToTriangle = function() {
			$scope.onTriangle = !!!$scope.onTriangle;
			$(".sidebarscroller").scrollTop(0);
		};

		$scope.clickMosaicCell = function(c,$event) {
			if($scope.editing) {
				c.choosen = !!!c.choosen;
			} else {
				$scope.theatreEnterElement(c);
			}
		};

		$scope.updateShapeshiftDelayed = function() {
			$scope.loading = false;
			var seenTutorial = localStorage.getItem("seenTutorial");

			// do it when the DOM is rendered !
			setTimeout(function() {

				$scope.$apply(); // make the data-order work ?

				$timeout(function () {
					console.log("Shapeshift rearrange order.");

					//$(".mosaic").trigger("ss-rearrange");
					// remake grid
					$(".mosaic").trigger("ss-destroy");
					$scope.initGrid($scope.editing);

					$(".mosaicscroller").scrollTop(0);
					$(".sidebarscroller").scrollTop(0);

					if($scope.willLaunchTutorial && !$scope.isAdmin() && !seenTutorial) {
						$scope.willLaunchTutorial = false;
						$scope.toggleTutorial(true);
					}
					if($scope.willLaunchTileId) {
						var tile = _.find($scope.cells, function(c) {
							return c.id==$scope.willLaunchTileId;
						});
						$scope.willLaunchTileId = false;
						if(tile) $scope.theatreEnterElement(tile);
						else console.log("Bad Tile ID. doing nothing.");
					}
				});
			}, 450);
		}
		/////////////////////////////////////////////////////////////
		$scope.getSelectedIds = function() {
			//console.log("Getting current order:");
			var list = _.map($(".mosaiccell.choosen"), function(e) { return $(e).attr("id"); });
			//console.log(list);
			return list;
		};
		$scope.finishedEditScenar = function(reload) {
			$scope.editing = false;
			_.each($scope.scenars, function(s) {
				s.edit = false;
			});
			$scope.newScenar = null;

			// if we were editing, and then cancel, we need to reload saved version !
			if(reload && $scope.scenar)
				$scope.loadScenar($scope.scenar);
		};
		$scope.reorderCellsBasedOnList = function(ids_list) {
			if(ids_list.length) {

				var nonc = 0;
				_.each($scope.cells, function(c) {
						c.order = ids_list.indexOf(c.id);
						c.choosen = c.order!=-1;
						if(!c.choosen) c.order = ids_list.length+(nonc++);
				});

			} else {

				$scope.cells = _.map($scope.cells, function(c) {
						c.order = c.i;
						c.choosen = true;
						return c;
				});

			}
			console.log("Cells re-ordered.");
		};
		$scope.loadScenar = function(s) {
			var scstr = s ? s : "exploration";
			console.log("Loading scenar: ",scstr);

			if(s) $scope.scenar = s;
			else {
				$scope.scenar = null;
				// if currently editing, then cancel
				$scope.finishedEditScenar();
			}
			// update the cells order
			$scope.reorderCellsBasedOnList( s ? s.items : [] );

			// trigger rearrange on shapeshift, to reorder cells physically
			$scope.updateShapeshiftDelayed();

			// update /location#hash with scenarid
			if(s)
				$location.hash(s.sid);
			else
				$location.hash("");

			// send a google analytics pageview !
			analytic("/crossings" + $location.url());
		};
		$scope.addScenar = function() {
			// cancel all editing
			$scope.finishedEditScenar();
			// create and add new scenar
			$scope.newScenar = {
				name: 'new scenar',
				status: 'unpublished',
				edit: true,
			};
			// reselect all cells
			_.each($scope.cells, function(c) {
				c.choosen = false;
			});
			$scope.scenar = $scope.newScenar;
			$scope.editing = true;

			// enable drag
			$(".mosaic").trigger("ss-destroy");
			$scope.initGrid(true);
		};
		$scope.editScenar = function(s) {
			// cancel all editing
			$scope.finishedEditScenar();
			// load and edit s
			s.edit = true;
			$scope.editing = true;
			$scope.loadScenar(s);
			// how do we set input focus when editing start ?
			//element.focus();

			// re-init grid with (drag enabled) will be set on loading scenar !
		};
		$scope.togglePublic = function(s) {
			if(s.edit) {
				if(s.status=='unpublished') {
					s.status = 'published';
					// also save scenario
					$scope.saveScenar(s);
				} else
					s.status = 'unpublished';
			}
			$scope.updateShapeshiftDelayed();
		};
		$scope.saveScenar = function(s,flag) {
			var list = $scope.getSelectedIds();
			if(list.length) {
				var params = {
					lang: 	 	$scope.lang,
					sid: 		s.sid,
					modecross: 	$scope.modecross,
					action: 	'update',
					name: 		s.name,
					status: 	s.status,
					items:  	list,
				};
				console.log("will save the scenario:",params);

				Api.scenarUpdate(params, function(res){
					console.log("Scenario update result:",res.data);
					if(!res.data.success) alert(res.data.message);
					else {
						// lets reload page at each save.
						$route.reload();

						/*
						// was toggled publish/unpublish ?
						s.status = res.data.scenar.status;
						s.items = res.data.scenar.items;

						if($scope.newScenar) { // means we were saving a newly created scenario
							// get saved scenar id returned by server & append to the local list
							s = res.data.scenar;
							$scope.scenar = s;
							$scope.scenars.push(s);
						}
						$scope.finishedEditScenar(true); // true to reload scenar after save (will reorder)
						*/
					}
				});
			} else {
				alert("you need to select at least one tessel to save scenario.");
			}
		};
		$scope.deleteScenar = function(s) {
			var params = {
				lang: 	 	$scope.lang,
				sid: 	 	s.sid,
				modecross: 	$scope.modecross,
				action: 	'delete',
			};
			Api.scenarUpdate(params, function(res){
				console.log("Scenario delete result:");
				console.log(res.data);
				if(!res.data.success) alert(res.data.message);
				else {
					$scope.scenars = _.without($scope.scenars,s);
					$scope.editing = false;
					// reload empty scenar
					$scope.loadScenar();
				}
			});
		};

		$scope.fetchRelated = function(modecross) {

			$scope.modecross = modecross;

			var params = {
				lang:  		$scope.lang,
				modecross:  modecross,
				fetch:  	$scope.isAdmin() ? "all" : "selection",
			};

			// ask for scene scenar ? no. at the moment set to default
			//if(scenar) params.sid = scenar.sid;


			console.log("Will fetch related of: ["+modecross+"]");
			//console.log(scenar);

			// if specific mode (voc/doc/book/search) then we will hide some UI elements
			$scope.scene = /^search|book|voc|doc|cont/i.test(modecross); // true will hide about panel
			$scope.onTriangle = $scope.scene;

			$rootScope.pagetitle = $scope.scene ? "AIME" : "AIME - ["+$scope.modecross.toUpperCase().replace("-","·")+"]"; //" - "+res.data.related.length;

			// fetch related elements
			Api.fetchRelated(params, function(res) {

				console.log("Fetched related: ",res.data);

				if(res.data.scenars) {
					$scope.scenars = _.map(res.data.scenars, function(s) {
						s.edit = false;
						return s;
					});
				}
				if(res.data.current) {
					// todo: only use current in scope (get rid of questions, description, which are already included !)
					$scope.current = res.data.current;

					var qs = res.data.current.questions;
					qs = _.map(qs, function(e,i) {
						e.question = Api.getQuestions($scope.lang, $scope.modecross.indexOf("-")==-1, i-1);
						return e;
					})
					// get first out (description)
					if(qs.length) $scope.description = qs.shift().answer;

					// others are the 4 questions
					//console.log(qs);
					$scope.questions = qs;
				} else {
					console.log("Empty MODE/CROSS !");
					$scope.description = null;
					$scope.questions = null;
				}

				/*
					we used to do here some manipulations on cells/tiles contents, like:
					- element.i : the default order
					- element.order : initially same as i, but updated if different scenar
					- element.slides_medias_flattened : all the medias in a single array rather than seperated by slides

					now it's made server side ! faster
					see server/app/controllers/bam.routes.js > flattenItem() / flattenItems()

					... so that cells contains slides_medias_flattened, and NO slides
				*/

				$scope.cells = res.data.related;

				// when fetching, load default/or/wanted scenar based on location
				var ws = $location.hash();
				if(ws) {
					var foundscenar = _.find($scope.scenars, function(s) {
						return s.sid==ws;
					});
					//console.log("Wanted scenar: ", scen);
					if(foundscenar) $scope.loadScenar(foundscenar);
					else $scope.loadScenar(null);
				} else
					$scope.loadScenar(null);


				// $("#counter").html(res.data.related.length);
				// var oldVal = +$("#counter").text();
				// var numAnim = new countUp("counter", oldVal, res.data.related.length);
				// numAnim.start();
			});
		};


		/////////////////////////////////////////////////////////////
		$scope.theatreExitElement = function() {
			forbidSwipe();

			// if was editing tile, alert() and cancel changes
			if($scope.editingTile) {

				var discard = confirm("Do you really want to discard unsaved changes and exit editor ?");
				if(discard) {
					// restore initial title
					_.find($scope.cells, function(c) {
						return c.id==$scope.editingTile.id;
					}).title = $scope.editingTileSavedTitle;

					if($scope.unsavedNewContrib) $scope.removeCell($scope.editingTile.id);
					$scope.editingTile = null;
					$scope.theatreCurrent = null;
					console.log("Discarded.");
				} else {
					console.log("Stay in editor.");
				}

			} else {

				$scope.theatreCurrent = null;

			}
		};
		var setTheatreIndexTo = function(index) {
			forbidSwipe();

			$scope.titleCollapsed = false;

			//$scope.docCurrent = 0;

			var N = $scope.cells.length;
			var s = $scope.scenar;
			if(s && s.status=='published') N = s.items.length;
			if(index<0) index = N-1;
			if(index>=N) index = 0;
			$scope.theatreCurrent = _.find($scope.cells, function(c) {
				return c.order==index;
			});
			console.log("Fullscreen looking at index: "+index+ " over "+N, $scope.theatreCurrent);

			// now binding scroll event to the current theatre content
			bindScrollToContentDelayed(index);
		};
		$scope.theatreEnterElement = function(e) {
			setTheatreIndexTo(e.order);
		};
		$scope.theatrePrev = function() {
			setTheatreIndexTo($scope.theatreCurrent.order - 1);
		};
		$scope.theatreNext = function() {
			setTheatreIndexTo($scope.theatreCurrent.order + 1);
		};
		// $scope.docGoTo = function(index) {
		// 	$scope.docCurrent = index;
		// 	console.log("go to doc slide:"+index);
		// };


		var bindScrollToContentDelayed = function(index) {
			setTimeout(function() {
				bindScrollToContent(index);
			},600);
		};
		var bindScrollToContent = function(index) {
			var scrollcont = angular.element("#content_"+index);

			/*
			console.log("scrolling():"+"#content_"+index);
			scrollcont.scroll();

			// what is the max scrollHeight ?
			$scope.theatreScrollH = scrollcont[0].scrollHeight - scrollcont[0].clientHeight;
			console.log("Binding scroll with .content scrollH: "+$scope.theatreScrollH);

			// allow swiping again ?
			// (delayed to avoid swiping 2+ slides at same time)
			setTimeout(function() {
				$scope.theatreCanSwipeX = true;
				$scope.theatreCanSwipeYt = true;
				$scope.theatreCanSwipeYb = $scope.theatreScrollH==0;
				console.log("---- Now can swipe again. vertical(s) allowed ? top/bottom: ",$scope.theatreCanSwipeYt,$scope.theatreCanSwipeYb);
			},900);
			*/

			// we'll listen to scroll level
			scrollcont.on('scroll', function(e) {
				var s = e.target.scrollTop;
				if(!$scope.titleCollapsed && s>40) {
					console.log("collapsing");
					$scope.titleCollapsed = true;
					$scope.$apply();
				}
				if($scope.titleCollapsed  && s<30) {
					$scope.titleCollapsed = false;
					$scope.$apply();
				}


				//console.log("scrolling ! "+s);
				//var pre = angular.element(e.target).parent().prev();
				//var classed = pre.hasClass("collapsed");

				/*
				$scope.theatreCanSwipeYt = s==0;
				$scope.theatreCanSwipeYb = s==$scope.theatreScrollH;
				if($scope.theatreCanSwipeYt || $scope.theatreCanSwipeYb) console.log("---- BORDER! top/bottom: ",$scope.theatreCanSwipeYt,$scope.theatreCanSwipeYb);
				*/
			});

			// TODO: UNBIND SCROLL LISTENER after !!
		};

		////////////////////////////////////////////////////////////////////////
		// here we'll manage the next/prev based on scrollwheel mouvement
		var forbidSwipe = function() {
			$scope.theatreCanSwipeX = false;
			$scope.theatreCanSwipeYt = false;
			$scope.theatreCanSwipeYb = false;
			//console.log("---- Swiping forbidden.");
		};
		var scrollSeuilY = 900;
		var scrollSeuilX = 300;
		$scope.mouseWheeling = function(event,delta,deltaX,deltaY) {
			//console.log("WHEEL!",deltaX,deltaY);
			if(($scope.theatreCanSwipeYb && deltaY<-scrollSeuilY) || ($scope.theatreCanSwipeX && deltaX> scrollSeuilX))
				$scope.theatreNext();
			if(($scope.theatreCanSwipeYt && deltaY> scrollSeuilY) || ($scope.theatreCanSwipeX && deltaX<-scrollSeuilX))
				$scope.theatrePrev();
		};

		//$document.keydown(function(e){
		$document.on('keydown', function(e){
			//console.log(e);
			if(!$scope.editingTile) { // if editing tile, disable all shorcuts

				if(e.keyCode==27) { // ESC
					if($scope.editing && !$scope.theatreCurrent) {
						$scope.finishedEditScenar(true); // true to reload saved scenar
						$scope.$apply();
					} else if($scope.lightboxed) {
						$scope.toggleLightbox();
						$scope.$apply();
					} else if($scope.theatreCurrent) {
						$scope.theatreExitElement();
						$scope.$apply();
					}
				}
				if($scope.theatreCurrent && !$scope.lightboxed) {
					if(e.keyCode==37) { // LEFT
						$scope.theatrePrev();
						$scope.$apply();
					}
					if(e.keyCode==39) { // RIGHT
						$scope.theatreNext();
						$scope.$apply();
					}
				}
				if(e.keyCode==83 && $scope.theatreCurrent) { // 'S' to select.unselect current theatre
					$scope.theatreCurrent.choosen = !!!$scope.theatreCurrent.choosen;
					$scope.$apply();
				}

			}
		});

		// will be triggered when mosaic ngRepeat ends
		$scope.$on('mosaCellsDone', function(ngRepeatFinishedEvent) {
			//console.log("NgRepeat - Mosaic cells done.");
			//$scope.initGrid(false);
		});
		// will be triggered when theatre ngRepeat ends
		$scope.$on('theatreCellsDone', function(ngRepeatFinishedEvent) {
			//console.log("NgRepeat - Theatre cells done.");
		});

		/////////////////////////////////////////////////////////////
		$scope.mediaInView = function(element, inview, inviewpart) {
			//console.log(element,inview,inviewpart);
			var e = angular.element(element);
			e.removeClass("visible top bottom both");
			e.addClass(inviewpart);
			if(inview) e.addClass("visible");
		};

		/////////////////////////////////////////////////////////////
		$scope.toggleLightbox = function(data) {
			//console.log("Toggle lightbox: ", data);
			if(data) {
				$scope.lightboxed = {
					url: $scope.getImgSrc(data),
					ref: data.ref
				};
			}
			else {
				$scope.lightboxed = null;
			}
		};

		//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		$scope.textify = function(text, dediv, modes, uppercases, maxcut, links, titletwolines) {
			var t = text;
			if(!t)
				return "";

			// remove spaces after [ & before ]
			t= t.replace(/\[(\s)*/g,'[')
				.replace(/(\s)*]/g,']');

			// <div replaced by <span
			if(dediv)
				t= $('<div>'+t+'</div>').text();
				//t= t.replace(/<div/g,"<span")
				//	.replace(/<\/div/g,"</span");

			// will insert <br/> at the 7th word (for 2-lined fullscreen titles)
			if(titletwolines) {
				var w = 7;
				var sp = t.split(' ');
				t= sp.length<w ? t : sp.slice(0,w).join(" ")+"<br/>"+sp.slice(w,sp.length).join(" ");
			}

			// truncate
			if(maxcut)
				t= t.length<=maxcut ? t : t.substr(0,maxcut) + "...";

			// ABCDEF which are NOT modes/cross
			if(uppercases) // "YES catch THOSE but [NOT NOT] but YES"
				t= t.replace(/([^\[^A-Z]|^)([A-Z]{3,})([^(\]|A-Z)]|$)/g,"\$1<span class='smallcaps'>\$2</span>\$3");

			if(modes && !links)
				t= t.replace(/\[([A-Za-z]{2,3})[\s·\.-]+([A-Za-z]{2,3})\]/g,"<span class='modecross'>[\$1·\$2]</span>")
					.replace(/\[([A-Za-z]{2,3})\]/g,"<span class='modecross'>[\$1]</span>");

			if(modes && links) {
				var lm = function(m) {
					return '<a href="'+$scope.conf.domain+'/aime/'+$scope.lang+'/voc/'+m.replace("·","-")+'" target="_blank">'+m+'</a>';
				};
				t= t.replace(/\[([A-Za-z]{2,3})[\s·\.-]*([A-Za-z]{2,3})\]/g,"<span class='modecross'>["+lm("\$1·\$2")+"]</span>")
					.replace(/\[([A-Za-z]{2,3})\]/g,"<span class='modecross'>["+lm("\$1")+"]</span>");
			}

			//t= $('<div>'+text+'</div>').text();
			// if(spanify)
			// 	t= t.replace(/<div/g,"<span")
			// 		.replace(/<\/div/g,"</span");

			return t;
		};
		$scope.updateTrustHtml = function(html) {
			// 1. scribd
			var scribdH = "650px";
			html = html.replace(/(<iframe class="scribd_iframe_embed" data-aspect-ratio="[^"]*" frameborder="0" height=")[^"]*(")/, "\$1"+scribdH+"\$2");

			// 2. youtube
			html = html.replace(/(<iframe width=")[^"]*(" height=")[^"]*(" src="http:\/\/www\.youtube\.com)/, "\$1100%\$2100%\$3");

			// 3. vimeo
			html = html.replace(/(<iframe src="\/\/player\.vimeo\.com\/video\/[\d]*" width=")[^"]*(" height=")[^"]*(")/, "\$1100%\$2100%\$3");

			// 4. ted
			var tedH = "450px";
			html = html.replace(/(<iframe src="http:\/\/embed\.ted\.com\/talks\/[_a-z\.]*" width=")[^"]*(" height=")[^"]*(")/, "\$1100%\$2"+tedH+"\$3");

			// 5. google doc
			var docH = "600px";
			html = html.replace(/(<iframe src="https:\/\/docs\.google\.com\/[^"]*" width=")[^"]*(" height=")[^"]*(")/, "\$1100%\$2"+docH+"\$3");

			return $sce.trustAsHtml(html);
		};
		$scope.getIframeSrc = function(m) {
			//return $sce.trustAsResourceUrl("http://localhost/PDF/Viewer.js/#../../aime-api-MEDIAS/"+m.content_id);
			// CONTRIBUTION document pdf
			if(m.html) {
				return $sce.trustAsResourceUrl($scope.conf.pdfUrl + m.url);
			}
			// DOCUMENT media
			else if(m.type=='pdf') {
				return $sce.trustAsResourceUrl($scope.conf.pdfUrl + m.content_id);
			} else if(m.type=='vimeo') {
				var vimeoid = m.hasOwnProperty('content_id') ? m.content_id : m.content;
				//console.log("vimeo id: "+vimeoid);
				return $sce.trustAsResourceUrl("http://player.vimeo.com/video/"+ vimeoid +"?title=0&byline=0&portrait=0&color=ffffff");
			} else
				return "-nosrc-";
		};
		$scope.getImgSrc = function(m) {
			var endpoint = settings.apiUrl;

			if (m.internal)
				return endpoint + '/resources/images/' + m.content;
			else
				return m.content;
		};
		//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

		/////////////////////////////////////////////////////////////
		$scope.toggleTutorial = function(show) {
			if(!$scope.tutorial && show) {
				$scope.tutorial = true;
				localStorage.setItem("seenTutorial", 1);

				$scope.headerOpened = false;
				$scope.onTriangle = false;

				analytic("/crossings" + $location.path() + "#tutorial");

				var tutos = Api.getTutorial($scope.lang);
				var step = 1;
				_.each(tutos, function(v,k) {
					var infos = v.split(" = ");
					//$('#'+k).attr('data-position',infos[0]);
					//$('#'+k).attr('data-intro',infos[1]);

					//$('#'+k).addClass('hint-bounce hint--always hint--rounded hint-'+infos[0]);
					//$('#'+k).attr('data-hint',infos[1]);

					$(k).attr('data-position',infos[0]);
					$(k).attr('data-tooltipClass','tooltip-'+k.replace(/^[#\.]/,"")); // remove selector (first # or .)
					$(k).attr('data-intro',infos[1]);
					$(k).attr('data-step',step++);

				});
				var eng = $scope.lang == "en";
				var introjs = introJs().setOptions({
					showBullets: false,
					showStepNumbers: false,
					skipLabel: eng? "Exit" : "Sortir",
					nextLabel: eng? "Next" : "Suivant",
					prevLabel: eng? "Back" : "Précédent",
					doneLabel: eng? "Done" : "Terminer",
				});
				introjs.onbeforechange(function(e) {
					var id = $(e).attr('id');
					//var dat = $(e).data('fortuto');
					console.log("intro.js, before change: "+id);
					// here we need to trigger clicks 'cause don't have access to $scope var

					//if(id=='switch') $('#modecross').click();
					//else $('.matrixwrapper').click();
					// if(id=='about') $('.matrixwrapper').click();

					//var menuCollapsed = $("#tutoheaderwrapper").hasClass('collapsed');
					//var ontriangle = $("#tutoswitcher").hasClass('ontriangle');

					//if(id=='tutoheaderwrapper' && menuCollapsed) $("#menutoggle").click();
					//if(id=='tutoabout' && !menuCollapsed) $("#menutoggle").click();

					//if(id=='tutosidebar' && !ontriangle) $("#tutoswitcher").click();
					//if(id=='description' && ontriangle) $("#tutoswitcher").click();

					if(id=='tutoscenar_exploration') $('#tutoscenar_exploration div.name').click();
					if(id=='tutoscenar_0') $('#tutoscenar_0 div.name').click();

					//if(id=='theatrenext') $(".mosaic_1").click();
					//if(id=='theatreclose') $("#theatrenext").click();

				});
				introjs.onexit(function() {
					console.log("intro.js: exited.");
					$scope.tutorial = false;
				});
				introjs.oncomplete(function() {
					console.log("intro.js: completed.");
					$scope.tutorial = false;
				});
				introjs.start();
			}
		};

		var modetrans = function(m,lang) {
			return lang=='en' ? m.replace(/DRO/i,"LAW").replace(/RES/i,"NET") : m.replace(/LAW/i,"DRO").replace(/NET/i,"RES");
		}

		/////////////////////////////////////////////////////////////
		$scope.switchLang = function(lang) {
			Api.changeLang(lang, function() {
				$location.path( "/"+lang+"/"+modetrans($scope.modecross,lang).toLowerCase() );
			});

			// $scope.headerOpened = false;
			// $location.path( "/"+lang+"/"+modetrans($scope.modecross,lang).toLowerCase() );
		};

		///////////////////////////////////////////////////////////// INIT
		$scope.lang = $routeParams.lang.toLowerCase();
		$scope.headerOpened = false;
		$scope.gridLoaded = false;
		$scope.hovermodecross = "init_one";
		$scope.scenar = null;
		$scope.scenars = [];
		$scope.theatreCurrent = null;
		$scope.editingTile = null;
		$scope.titleCollapsed = false;
		$scope.loading = true;

		if($routeParams.wantedmodecross) {

			var m = $routeParams.wantedmodecross.toUpperCase();
			$scope.modecross = modetrans(m, $scope.lang);

			$scope.initConfig();

			if($location.hash()=="tutorial" && !$scope.isAdmin())
				$scope.willLaunchTutorial = true;
			if(/^(bsc_)|(voc_)|(doc_)|(cont_)/.test($location.hash()))
				$scope.willLaunchTileId = $location.hash();

			$scope.fetchRelated($scope.modecross);

		} else {

			console.log("Weird. we should have a modecross (?).");

		}


		// when clicking "new tile", prepair a new empty object
		$scope.tileCreate = function() {
			// do not call the server now, just create it locally
			$scope.editingTile = {
				author: 	{ // let's use the existing AIME Team user
					name: "AIME Team",
					id: "author_47"
				},
				cat: 			"cont",
				choosen: 	true,
				date: 		Date(),
				id: 			"cont_"+Date.now(),
				i: 				$scope.cells.length, // to be the last one in the list after reorder !
				order: 		0, // will be updated anyway on following reorder
				lang: 		$scope.lang,
				link: 		"http://none.yet.because.created.on.crossings.platform",
				status: 	"private",
				text: 		"Placeholder text of the contribution",
				thumbnail: {
					type: 		"txt",
					content: 	"thumbnail not yet available"
				},
				related:  [$scope.modecross],
				title: 		"",
				textarea: "",
				origin: 	"crossings_platform",
			};

			console.log("Creating new element",$scope.editingTile);
			$scope.unsavedNewContrib = true;

			// add new cell
			$scope.cells.push($scope.editingTile);
			// refresh ordercells
			$scope.reorderCellsBasedOnList([]); // empty list provided, order will be based on cell.i . new one will be last ! (i = cells.length)
			// reorder cells' mosaic
			$scope.updateShapeshiftDelayed();
			// go fullscreen
			$scope.theatreEnterElement($scope.editingTile);
		};

		// from a (object) tile, build the (text) textarea
		$scope.tileContentTextify = function(o) {
			var t = o.text;
			_.each(o.slides, function(s) {
				t += "\n\n";
				t += s.text ? s.text.trim() : "";
				if(s.document||s.ref) t+= s.text ? "\n-" : "-";
				if(s.document) t+="\ndoc: "+s.document.url;
				if(s.ref) t+="\nref: "+s.ref;
			});
			return t;
		};

		// from a (text) textarea, make (object) tile
		$scope.tileContentSlidify = function(text) {
			var o = {};
			// split all bunches of text separated by 2 new lines
			var bunches = text.trim().split(/\s*\n{1,}\s*\n{1,}\s*/g);
			o.text = bunches.shift();
			var slides = [];
			_.each(bunches, function(b) {
				var txt = null,
						doc = null,
						ref = null;
				var parts = b.split(/\n*-\n/);
				//console.log(parts);
				if(parts.length==1) { // only text

					txt = parts[0];

				} else if(parts.length==2) {

					if(parts[0]) txt = parts[0];
					if(parts[1]) {
						var d = parts[1].match(/doc:\s*([^\n]*)/);
						var r = parts[1].match(/ref:\s*([^\n]*)/);
						doc = d ? {url:d[1] , html:d[1], type:"link"} : null;
						ref = r ? r[1] : null;
					}

				} else {

					console.log("weird split. look at the code, please.");

				}
				slides.push({
					text: txt,
					document: doc,
					ref: ref
				});
			});

			o.slides = slides;
			return o;
		};

		$scope.togglePublish = function(e) {
			e.status = e.status=='private' ? 'public' : 'private';
			$scope.theatreSaveElement(e);
		};

		// enter edit mode on already existing element
		$scope.theatreEditElement = function(e) {
			e.textarea = $scope.tileContentTextify(e);
			$scope.editingTile = e;
			// because ng-model will store the modifs even if don't saved,
			// we need to store the initial title to restore it if needed
			$scope.editingTileSavedTitle = e.title;
			console.log("Entering edit of:",$scope.editingTile);
		};

		$scope.removeCell = function(cell_id) {
			$scope.cells = _.filter($scope.cells, function(c) {
				return c.id!=cell_id;
			});
			$scope.editingTile = null;
			$scope.theatreCurrent = null;
			$scope.unsavedNewContrib = null;
			$scope.reorderCellsBasedOnList([]); // empty list provided, order will be based on cell.i . new one will be last ! (i = cells.length)
			// reorder cells' mosaic
			$scope.updateShapeshiftDelayed();
		};

		// will update the element
		$scope.theatreSaveElement = function(e) {

			//console.log("Editing:",$scope.editingTile);

			var call = false;

			if($scope.editingTile) { // EITHER we were currently editing content

				var withslid = $scope.tileContentSlidify(e.textarea);

				// now put in tile what was updated in b
				_.extend(e, withslid);

				console.log("Edited:",e);

				if(e.textarea=="") {
					call = confirm("Do you really want to delete this contribution ?");
				} else {
					call = true;
				}

			} else { // EITHER we are just updating/saving 'status' value

				call = true;

			}

			if(call) {

				$scope.unsavedNewContrib = false;

				Api.elementUpdate({ item: e }, function(res) {

					console.log("Updated result:",res.data);

					if(!res.data.success) alert(res.data.message);
					else {

						// update local version with the server-returned item (supposing it's the theatreCurrent viewed one!)
						var n = res.data.item;

						if(n) { // UPDATE

							_.each($scope.cells, function(c) {
								if(c.id==n.id) {
									//console.log("newly one !",c,res.data.item);
									c.status = n.status;
									c.title = n.title;
									c.text = n.text;
									c.slides_medias_flattened = n.slides_medias_flattened;
									$scope.theatreCurrent = n;
								}
							});
							$scope.editingTile = null;
							console.log("Cell updated !",$scope.theatreCurrent);

						} else { // REMOVE

							$scope.removeCell($scope.editingTile.id);
							console.log("Cell removed !");

						}
					}
				});
			}
		};

		//////////////////////////////////////////////////////////////// SEARCH
		// search box
		$scope.launchSearch = function(query) {
			console.log("Searching: "+query);
			if(query.length>0) {
				$scope.fetchRelated("search#"+query);
				//$location.url("/"+$scope.lang+"/);
			}
		};


		//////////////////////////////////////////////////////////////// TYPEAHEAD TO ADD TILES
		$scope.initAddTilesAhead = function() {
			Api.fetchTilesAhead({lang:$scope.lang}, function(res) {

				//console.log("TilesAhead:",res.data);

				$('#typeahead').typeahead({
				  hint: true,
				  highlight: true,
				  minLength: 1
				},
				{
				  name: 'items',
				  displayKey: 'title',
				  source: function(q,cb) {
				    var matches = [],
				    		regs = _.map(q.split(" "), function(m) {
				    			return new RegExp(m,'i');
				    		});

				    _.each(res.data, function(e,i) {
				    	// if all of the regexps match
				    	var match = _.all(regs, function(r) {
				    		return r.test(e.title);
				    	});
				      if(match)
				      	matches.push({
				      		title: e.title,
				      		id: e.id,
				      		link: e.link
				      	});
				    });
				    cb(matches);
				  }
				}).on('typeahead:selected',function(obj,datum) {
				    //console.log(datum);
				    $scope.aheadChoice = datum;
				    $scope.$apply();
				});

				console.log("TilesAhead Made.");

			});
		};
		$scope.aheadSubmit = function() {
			Api.addRelated({
					lang: 			$scope.lang,
					modecross: 	$scope.modecross,
					id: 				$scope.aheadChoice.id
				}, function(res) {
				if(!res.data.success) alert(res.data.message);
				else {
					// reload page to fetch added one
					$route.reload();
					//alert(res.data.message);
				}
			});
		};

		// get the theatrecell (edit|view) template (cf 'theatrecell' directive)
		$scope.getTheatreTemplateUrl = function(c) {
			var m = 'view';
			if($scope.editingTile)
				m = $scope.editingTile.id == c.id ? "edit" : "view";
			return 'partials/theatre_'+m+'.html';
		};

	}])
