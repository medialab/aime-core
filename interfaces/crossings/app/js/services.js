'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('myApp.services', [])
	.value('version', '0.1')

	.factory('Api', ["$http","settings","$window","$location", function($http,settings,$window,$location) {

		var b = settings.apiUrl;

		return {

			changeLang: function(newLang, callback) {
				$http({
					method: 'POST',
					url: b+'/lang/' + newLang
				}).success(function(data) {
					callback();
				}).error(function() {callback();});
			},

			fetchConfig: function(params,callback) {
				$http({
					method: 	'GET',
					url: 		b+"/crossings/config",
					params: 	params,
				}).success(function(data){

					// returning fetched data
					return callback({data: data.result});
				}).error(function(data, status, headers, config) {

					// redirect to inquiry's login page, with #crossings/.../ hash to redirect here after that
					if (status === 401)
						return $window.location.href = params.redirectUrl;
				});
			},

			fetchTilesAhead: function(params,callback) {
				$http({
					method: 	'GET',
					url: 			b+"/crossings/tiles",
					params: 	params,
				}).then(function(data){ callback({data: data.data.result}) });
			},

			addRelated: function(params,callback) {
				$http({
					method: 	'GET',
					url: 			b+"/crossings/addrelated",
					params: 	params,
				}).then(function(data){ callback({data: data.data.result}) });
			},

			fetchRelated: function(params,callback) {
				var ismodecross = ["book","voc","doc","cont"].indexOf(params.modecross.toLowerCase())==-1;
				var url = ismodecross ? b+"/crossings/related/"+params.modecross : b+"/crossings/elements/"+params.modecross;
				if(/^search/.test(params.modecross.toLowerCase())) {
					url = b+"/crossings/search";
					params = {
						q: 			params.modecross.split("#")[1],
						lang: 		params.lang
					};
				}
				$http({
					method: 	'GET',
					url: 		url,
					params: 	params,
				}).then(function(data){callback({data: data.data.result}); });
			},

			scenarCreate: function(params,callback) {
				$http({
					method: 'POST',
					url: b+'/scenario',
					data: params
				}).then(function(data){ callback(data.result); });
			},

			scenarUpdate: function(params,callback) {
				$http({
					method: 'PUT',
					url: b+'/scenario',
					data: params
				}).then(function(data){ callback(data.result); });
			},

			scenarDestroy: function(params,callback) {

			},

			scenarPublish: function(params,callback) {

			},

			scenarUnpublish: function(params,callback) {

			},

			elementUpdate: function(params,callback) {
				$http
					.post(b+"/crossings/element/update", params)
					.then(function(data){ callback(data.result); });
			},

			// following is kept in case (nb: everything is well plugged server side)
			/*authTest: function(callback) {
				$http({
					method: 'GET',
					url: 	b+"/crossings/testlogin",
				}).then(function(data){ callback(data); });
			},

			authLogIn: function(params,callback) {
				$http({
					headers: {'Content-Type': 'application/x-www-form-urlencoded'},
					method: 'POST',
					url: 	b+"/auth/login",
					data: 	$.param(params)
				}).then(function(data){ callback(data); });
			},

			authLogOut: function(callback) {
				$http({
					method: 'GET',
					url: 	b+"/auth/logout",
				}).then(function(data){ callback(data); });
			},*/

			getTranslations: function() {
				return {
          // header
          "terms of use | legal notice | support | credits": "conditions générales d'utilisation | mentions légales | soutien | credits",
          "book": "livre",
          "contribute": "contribuer",
          "home": "accueil",
          "more": "plus", // now we have icon
          "less": "moins", // now we have icon
          "launch tutorial": "visite guidée",
          "click here to enter the book and contribute": "cliquez ici pour entrer dans le livre et contribuer",
          // mosaic
          "read more":"ouvrir",
          // sidebar
          "Explore": "Exploration",
          "back to selected":"retour",
          "switch mode or crossing":"changer de mode ou de croisement",
          "click the triangle to display tiles related to a specific mode or crossing":"cliquez ci-dessous pour afficher les tesselles associées à un mode ou croisement",
          "click below to display all the tiles of the inquiry":"cliquez ci-dessous pour afficher toutes les tesselles de l'enquête",
          "or display tiles based on a search query":"ou les tesselles associées à une recherche",
          "text":"texte",
          "vocabulary entries":"vocabulaire",
          "documents":"documents",
          "contributions":"contributions",
        };
			},

			getTutorial: function(lang) {
				var mce = 'mode/crossing'; //<span class="modecross">[MODE/CROSS]</span>';
				var mcf = 'mode/croisement';
				var tuto = {

					'en':{
						'#tutoheaderwrapper':"bottom = This is a guided tour of the AIME inquiry through the crossings",
						'#tutoabout':'left = The right panel displays information about the selected mode or crossing',
						'#tutoswitcher':'left = Click here to display the pivot table with all modes & crossings. '+
								'<img src="img/matrix.png"/>'+
								'The triangle allows you to access any mode or crossing. The size of each circle reflects the number of related elements',

						'#description':'left = A short introduction describes the current selected mode or crossing at a glance',
						'#questions':"left = Four answers from the inquiry's questionnaire",

						'#mosaiccontainer':"right = The <i>tiles</i> are elements fetched from the inquiry whenever they:"+
								//"<ul><li>contributions</li><li>documents</li><li>vocabulary entries</li><li>book subheads</li></ul>"+
								"<ul><li>contain a "+mce+" in their title or full text</li>"+
								"<li>are linked to the "+mce+" voc entry</li>"+
								"<li>are linked to a book chapter related to the "+mce+"</li></ul>"+
								"By default you can consult all the related <i>tiles</i> of the current mode or crossing, ordered by:"+
								'<ul><li>latest contributions</li>'+
								'<li>vocabulary & documents (alphabetically)</li>'+
								'<li>book chapters</li></ul>',

						'#tutoscenar_0':"left = For each mode or crossing, you may also find additional scenarios (selected one appears in red). "+
								"Tiles are filtered & ordered based on the current selected scenario.",

						'.tutomosaic_0':'bottom = Click on a tile to open it',
						'#menutoggle':'left = Click "<i>more</i>" to switch language, see terms and links about the project. Especially:'+
								"<ul><li><i>BOOK</i>: to go back to the first platform (where you can contribute)</li>"+
								"<li><i>CONTRIBUTE</i>: to learn about the contribution process and what we call a <i>contribution</i></li>"+
								"<li><i>HOME</i>: to go back to the project homepage and blog</li></ul>",

						'#menuhelp':"left = Click the question mark if you want to see this tutorial again",
						},

					'fr':{
						'#tutoheaderwrapper':"bottom = Bienvenue dans la visite guidée de l'enquête EME par les croisements",
						'#tutoabout':"left = La partie droite de l'écran affiche des informations relatives au mode/croisement en cours de consultation",
						'#tutoswitcher':"left = Cliquez ici pour afficher le tableau croisé, version synoptique de l'ensemble des modes et croisements de l'enquête."+
								'<img src="img/matrix.png"/>'+
								"La taille des hexagones correspond au nombre d'éléments associés (provenants de l'enquête)",

						'#description':"left = Un court texte de présentation introduit le mode/croisement",
						'#questions':"left = Les quatres réponses au questionnaire de l'enquête",

						'#mosaiccontainer':"right = Les <i>tesselles</i> associées sont extraites de l'enquête lorsqu'elles:"+
								//"<ul><li>contributions</li><li>documents</li><li>entrées de vocabulaire</li><li>sous-chapitres</li></ul>"+
								"<ul><li>contiennent une référence au "+mcf+" dans leur titre ou contenu</li>"+
								"<li>sont liées à l'entrée correspondante du "+mcf+"</li>"+
								"<li>sont liées au chapitre du livre traitant du "+mcf+"</li></ul>"+
								"Par default, le <i>mode exploration</i> affiche l'ensemble des tesselles associées au mode/croisement, dans l'ordre suivant:"+
								'<ul><li>les contributions les plus récentes de la plateforme</li>'+
								'<li>les documents et les entrées de vocabulaire (ordre alphabétique)</li>'+
								'<li>les sous-chapitres du livre</li></ul>',

						'#tutoscenar_0':"left = Certains modes/croisements sont accompagnés d'une liste de scénarisations (celle qui est selectionné apparaît en rouge). "+
								"Elles correspondent à un filtrage et ordonnancement particulier permettant d'aborder le mode/croisement d'un angle nouveau",

						'.tutomosaic_0':'bottom = Cliquez sur une tesselle pour la consulter en plein écran',
						'#menutoggle':"left = Cliquez ici pour changer de langue et accéder aux différents liens du projet. En particulier:"+
								"<ul><li><i>LIVRE</i>: pour consulter la plateforme de l'enquête permettant de contribuer</li>"+
								"<li><i>CONTRIBUER</i>: pour mieux comprendre ce que peut être une <i>contribution</i></li>"+
								"<li><i>ACCUEIL</i>: pour retourner à la page d'accueil du projet</li></ul>",

						'#menuhelp':"left = Cliquez sur le point d'interrogation pour lancer le tutorial à nouveau",
					}
				};
				return tuto[lang];
			},
			getQuestions: function(lang,ismode,index) {
				var c = {
					'en':[
						'Handholds & trials',
						'Institution through history',
						'What we learn about the modes',
						'Aims to enable crossing to be emphasized',
					],
					'fr':[
						"Prises et épreuves",
						"Institution au cours de l'histoire",
						"Ce qu'on apprend sur les modes",
						"Buts de l'enquête pour instituer le croisement",
					]
				};
				var m = {
					'en':[
						"A certain kind of continuity, a trajectory, obtained by a certain type of discontinuity, the hiatus",
						"Particular kinds of felicity and infelicity conditions",
						"The specifications of the type of beings that the mode leaves in its wake",
						"A mode of alteration of the being-as-other",
					],
					'fr':[
						"Un certain type de continuité, la trajectoire, obtenue par un certain type de discontinuité, le hiatus",
						"Un type particulier de conditions de félicité et d'infélicité",
						"Le cahier des charges que le mode laisse dans son sillage",
						"Mode d'altération de l'être-en-tant-qu'autre",
					]
				};
				return ismode ? m[lang][index] : c[lang][index];
			},

		};
    }]);
