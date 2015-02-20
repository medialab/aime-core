( function( $, window, undefined ){
	'use strict';

	window.maze = window.maze || {};


  maze.ACTION_NOTEBOOK = 'NOTEBOOK';
  maze.ACTION_SET_COMM_LEADER = 'CONTRIB';

  maze.ACTION_CONTRIBUTION_BOOKMARK = 'bookmark';
  maze.ACTION_CONTRIBUTION_GET = 'get';
  maze.ACTION_CONTRIBUTION_ADD = 'add';
  maze.ACTION_CONTRIBUTION_EDIT = 'edit';
  maze.ACTION_CONTRIBUTION_REMOVE = 'remove';
  maze.ACTION_CONTRIBUTION_MAKE_PUBLIC = 'make-public';
  maze.ACTION_CONTRIBUTION_ADD_SLIDE = 'add-slide';

  maze.TYPE_CONTRIBUTION_TITLE = 0;
  maze.TYPE_CONTRIBUTION_SLIDE = 1;
  maze.TYPE_CONTRIBUTION_OBJECTION = 2;
  maze.TYPE_CONTRIBUTION_CITATION = 3;

  maze.TYPE_NOTEBOOK_STAR = 'STAR';
  maze.TYPE_NOTEBOOK_ADD = 'ADD';
  maze.TYPE_NOTEBOOK_EDIT = 'EDIT';
  maze.TYPE_NOTEBOOK_DELETE = 'DELETE';

  maze.DELAY_MAX = 800;
  maze.DELAY_BETWEEN_SWIPE = 70;

  maze.STATUS_STARTUP = 'STARTUP';
  maze.STATUS_CALLING = 'CALLING';
  maze.STATUS_READY = 'READY';
  maze.STATUS_BUSY = 'BUSY';

  maze.AUTHORIZATION_UNKNOWN = 'AUTHORIZATION_UNKNOWN';
  maze.AUTHORIZATION_AUTHORIZED = 'AUTHORIZATION_AUTHORIZED';
  maze.AUTHORIZATION_REQUIRED = 'AUTHORIZATION_REQUIRED';
  maze.AUTHORIZATION_FAILED = 'AUTHORIZATION_FAILED';
  maze.AUTHORIZATION_SIGNUP = 'AUTHORIZATION_SIGNUP';

  maze.user = 'anonymous';
  maze.today = Date();
  maze.role = 'guest';

  maze.columns = {};

  /*
  The hash for the "current" element id
  (e.g. on scroll)
  */
  maze.cursor = {};
  maze.cursor.chapter = false;
  maze.cursor.subheading = false;

  /*
  The hash for timeout sequences
  */
  maze.timer = {};

	maze.vars = maze.vars || {};
	maze.urls = maze.urls || {};
	maze.timers = {};
	/*


	    Logs
	    ====

	*/
	maze.log = function(){
		if( !maze.debug  || !maze.verbose ) return;
		// return
		try{
			var args = ['    ' ].concat( Array.prototype.slice.call(arguments) );
			console.log.apply(console, args );
		} catch(e){

		}
	}

	maze.error = function(){
    if( !maze.debug ) return;
		try{
			var args = ['   /\\  \n  /  \\\n / !! \\ ERROR maze:' ].concat( Array.prototype.slice.call(arguments) );
			args.push('\n/______\\')
			console.log.apply( console, args );
		} catch(e){}
	}

	maze.info = function(){
    if( !maze.debug ) return;
		try{
			var args = ['>>>> INFO maze:'].concat( Array.prototype.slice.call(arguments) );
			console.log.apply( console, args );
		} catch(e){}

	}



	/*


		WINDOW On / Trigger helpers
		===========================

	*/
	maze.events = maze.events || {};
	maze.on = function( eventType, selector, callback ){
		typeof callback == "undefined"? $(window).on( eventType, selector ): $(document).on( eventType, selector, callback );
	};

	maze.trigger = function ( eventType, data, nextEvent ){
		// nextevent sample: nextevent: { event: 'event name', data:{} }
		if( typeof data != "undefined" && data.delay ){
			clearTimeout( maze.vars[ 'timer_event_' + eventType ] );
			maze.vars[ 'timer_event_' + eventType ] = setTimeout( function(){
				$(window).trigger( eventType, typeof nextEvent != "undefined"? maze.chain(data, nextEvent): data );
			}, data.delay );
		} else {
			$(window).trigger( eventType, typeof nextEvent != "undefined"? maze.chain(data, nextEvent): data );
		}
		return true;
	};

	maze.chain = function( data, nextEvent ){
		data.next = nextEvent;
		return data;
	}

	maze.propagate = function( data ){
		typeof data.next != "undefined" && typeof data.next.event != "undefined" && maze.trigger( data.next.event, data.next.data )
	}




	/*


	    Restful API
	    ===========

	*/
	maze.api = {
		settings:{
			'get':{dataType:"Json",type:"POST",fault:maze.fault } ,
			'post':{dataType:"Json",type:"POST",fault:maze.fault }
		}
	};

	maze.api.init = function(){
		// maze.vars.csrftoken = maze.fn.get_cookie('csrftoken');
		// $.ajaxSetup({
		// 	crossDomain: false, // obviates need for sameOrigin test
		// 	beforeSend: function(xhr, settings) { if (!(/^(GET|HEAD|OPTIONS|TRACE)$/.test(settings.type))){ xhr.setRequestHeader("X-CSRFToken", maze.vars.csrftoken);}}
		// });maze.log("[maze.api.init]");
	}

	maze.api.process = function( result, callback, namespace ){
		if( result.status == 'ok'){
			if (typeof callback == "object"){
				maze.toast( callback.message, callback.title );
			} else return callback( result );
		} else if( result.code == 'IntegrityError' ){
			$("#"+namespace+"_slug").addClass("invalid");
			maze.toast(  maze.i18n.translate("this slug is already used") , maze.i18n.translate("error"), {stayTime:3000, cleanup: true});
		} else if( typeof result.error == "object" ){
			maze.invalidate( result.error, namespace );
			maze.toast(  maze.i18n.translate("invalid form") , maze.i18n.translate("error"), {stayTime:3000, cleanup: true});
		} else {
			maze.toast( result.error , maze.i18n.translate("error"), {stayTime:3000, cleanup: true});
		}
	}

	maze.api.urlfactory = function( url, factor, pattern ){
		if( typeof factor == "undefined" ){ ds.log("[ds.m.api.urlfactory] warning'"); return url; };
		pattern = typeof pattern == "undefined"? "/0/":pattern ;
		return url.replace( pattern, ["/",factor,"/"].join("") )
	}

	/*
		Handle with care.
		This function add a add+edit+remove+get function to maze.api.<your model>
		E.g to add a filter to maze.api.serie.get:

			maze.api.compile('serie');

			maze.magic.serie.list = function( result ){
				alert('list');
			}

			maze.api.serie.list({
				'filters': JSON.stringify({
					"language":"fr"
				})
			});

		Cfr. maze.api.Builder

		@param model	- your model, a.k.a maze.api namespace

	*/
	maze.api.compile = function( model ){ maze.log( '[maze.api.compile ]', model );
		maze.api[ model ] = new maze.api.Builder( model )
	}



	maze.api.Builder = function( model ){

		var instance = this;

		this.methods = [ 'get', 'post', 'list', 'add', 'remove', 'edit', 'search', 'fetch', 'infinite' ];
		this.model = model;

		this.get = function( params, callback ){

			return instance.ajax( 'get', 'get', params, maze.urls[ 'get_' + instance.model ], callback  );

		}

		this.infinite = function( params, callback ){

			return instance.ajax( 'post', 'infinite', params, maze.urls[ 'infinite_' + instance.model ], callback  );

		}


		this.search = function( params, callback ){

			return instance.ajax( 'post', 'search', params, maze.urls[ 'search_' + instance.model ], callback  );

		}

		this.post = function( params, callback ){

			instance.ajax( 'post', 'post', params, maze.urls[ 'post_' + instance.model ], callback  );
		}

		this.edit = function( params, callback ){

			instance.ajax( 'post', 'edit', params, maze.api.urlfactory( maze.urls[ 'edit_' + instance.model ], params.id ), callback  );
		}

		this.fetch = function( params, callback ){
			return instance.ajax( 'post', 'fetch', params, maze.urls[ 'fetch_' + instance.model ], callback );
		}

		this.list = function( params, callback ){
			return instance.ajax( 'post', 'list', params, maze.urls[ 'list_' + instance.model ], callback );
		}

		this.sync = function( params, callback ){
			params.ids = JSON.stringify( params.ids );
			instance.ajax( 'post', 'sync', params, maze.urls[ 'sync_' + instance.model ], callback );
		}

		this.add = function( params ){
			instance.ajax( 'post', 'add', params, maze.urls[ 'add_' + instance.model ] );
		}

		this.remove = function( params ){
			params['method'] = 'DELETE'
			instance.ajax( 'delete', 'remove', params, maze.api.urlfactory( maze.urls[ 'remove_' + instance.model ], params.id ) );
		}

		this.ajax = function( http_method, method, params, url, callback ){
			params.YII_CSRF_TOKEN = maze.YII_CSRF_TOKEN;
			// maze.log( '[maze.api.' + instance.model + '.' + method + '] url :', url, ", params :",params );
			$.ajax( $.extend( maze.api.settings[ http_method ],{
				url: url,
				data: params,
				success:function(result){ // maze.log( '[maze.api.' + instance.model + '.' + method + '] result :', result );
					typeof callback == "undefined" ? maze.magic[ instance.model ][ method ](result) : callback(result);
					// maze.api.process( result, typeof callback == "undefined" ? maze.magic[ instance.model ][ method ]: callback, typeof params.auto_id == "undefined"? "id_" + method + "_" + instance.model: params.auto_id );
			}})).fail( function(data){
				maze.error( '[maze.api.' + instance.model + '.' + method + '] FAILED miserabilmente. url :', url, ", params :",params );
				typeof maze.magic[instance.model].failed == "function" && maze.magic[instance.model].failed( data );
			});

			return true;
		}

		// check urls availability
		for(var i in instance.methods ){
			maze.log('[maze.api.Builder:' + instance.model +']', 'urls ', instance.methods[i] + '_' + instance.model, ":", typeof maze.urls[ instance.methods[i] + '_' + instance.model ] != "undefined" )
		}

	}


	/*


	    Modals (Bmazetstrap)
	    ==================

	*/
	maze.modals = {}
	maze.modals.init = function(){
		$(".modal").each( function( i, el ){ var $el = $(el); $(el).css("margin-top",- Math.round( $(el).height() / 2 )); }); maze.log("[maze.modals.init]");
	};


	/*


	    Tooltip
	    =======

	*/
	maze.tooltip = {}
	maze.tooltip.init = function(){
		$('body').tooltip({ selector:'[rel=tooltip]', animation: false, placement: function( tooltip, caller ){ var placement = $(caller).attr('data-tooltip-placement'); return typeof placement != "undefined"? placement: 'top'; } }); maze.log("[maze.tooltip.init]");};


	/*


	    Toast
	    =====

	*/
	maze.toast = function( message, title, options ){
		if(!options){options={}}if(typeof title=="object"){options=title;title=undefined}if(options.cleanup!=undefined)$().toastmessage("cleanToast");var settings=$.extend({text:"<div>"+(!title?"<h1>"+message+"</h1>":"<h1>"+title+"</h1><p>"+message+"</p>")+"</div>",type:"notice",position:"middle-center",inEffectDuration:200,outEffectDuration:200,stayTime:1000},options);$().toastmessage("showToast",settings)
	};


	/*


	    Invalidate, Fault
	    =================

	*/
	maze.invalidate = function( errors, namespace ){ if (!namespace){ namespace = "id";} maze.log("[maze.invalidate] namespace:",namespace, " errors:",errors );
		for (var i in errors){
			if( i.indexOf("_date") != -1  ){
				$("#"+namespace+"_"+i+"_day").parent().addClass("invalid");
				continue;
			} else if (i.indexOf("_type") != -1 ){
				$("#"+namespace+"_"+i).parent().addClass("invalid");
				continue;
			} else if( i.indexOf("_hours") != -1 || i.indexOf("_minutes") != -1  ) {
				$("#"+namespace+"_"+i).parent().addClass("invalid");
				continue;
			} else if(i.indexOf("captcha") != -1 ) {
				$("#recaptcha_response_field").addClass("invalid");
				continue;
			}
			$("#"+namespace+"_"+i).addClass("invalid");
		}
	}

	maze.fault = function( message ){ maze.log("[maze.fault] message:", message );
		message = typeof message == "undefined"? "": message;
		maze.toast( message, maze.i18n.translate("connection error"), {stayTime:3000, cleanup: true});
	}


	/*


	    Common function
	    ===============

	*/
	maze.fn = {};
	maze.fn.slug = function( sluggable ){
		return sluggable.replace(/[^a-zA-Z 0-9-]+/g,'').toLowerCase().replace(/\s/g,'-');
	};

	maze.fn.get_cookie = function (e){
		var t=null;
		if(document.cookie&&document.cookie!=""){
			var n=document.cookie.split(";");
			for(var r=0;r< n.length;r++) {
				var i=jQuery.trim(n[r]);
				if(i.substring(0,e.length+1)==e+"=") {
					t=decodeURIComponent(i.substring(e.length+1));
					break}
				}
			}
		return t;
	};

	maze.fn.wait = function( fn, options ){

		var timer = [options.id, options.delay].join('-');
		clearTimeout( maze.timers[  timer ] );
		maze.timers[  timer ] = setTimeout( function(){
			fn.apply( this, options.args);
		}, options.delay );

	}

	maze.fn.is_array = function( variable ){
		return Object.prototype.toString.call( variable ) === '[object Array]';
	}

	maze.fn.grab = function( list, iterator ){
		var result;

		for( var i in list ){
			try{
				if( iterator( list[i] ) )
					return list[i];
			} catch(e){
				continue;
			}

			if( typeof list[i] == "object" ){
				result = maze.fn.grab( list[i], iterator );
				if( result !== false )
					return result;
			}
		}
		return false;
	};

  maze.fn.equals = function(a, b) {
    var not_in_b = [],
        not_in_a = [];

    for ( var i = 0; i < a.length; i++)
      b.indexOf( a[i] ) == -1 && not_in_b.push(a[i]);

    for ( var i = 0; i < b.length; i++)
      a.indexOf( b[i] ) == -1 && not_in_a.push(a[i]);

    return not_in_b.length + not_in_a.length == 0;
  }

  maze.fn.unique = function( arr ) {
    return arr.reverse().filter(function (e, i, arr) {
      return arr.indexOf(e, i+1) === -1;
    }).reverse();
  };


	/*


	    I18n
	    ====

	*/
	maze.i18n = {
		lang: 'en',
		dict: {}
	};
	maze.i18n.translate = function( key, lang ){
		if( typeof lang != "undefined" )
			maze.i18n.lang = lang;

		var l = maze.i18n.lang;
		if ( maze.i18n.dict[l][key] == undefined	)
			return key;
		return 	maze.i18n.dict[l][key];
	}

	// maze.i18n.dict = maze.i18n.dict || {
	// 	'fr':{
	// 		'no results found':"votre recherche n'a donné aucun résultat",
	// 		"page not found":"page non trouvée",
	// 		"connection error":"Connection error",
	// 		"warning":"Attention",
	// 		"delete selected absence":"Voulez-vous supprimer cette absence?",
	// 		"offline device":"Échec de la connexion.",
	// 		"check internet connection":"Veuillez vérifier la connexion internet de la tablette.",
	// 		"welcome back":"welcome back",
	// 		"loading":"chargement en cours…",
	// 		"form errors":"Erreurs dans le formulaire",
	// 		"error":"Erreur",
	// 		"invalid form":"Veuillez vérifier les champs en rouge.",
	// 		"empty dates":"Les dates de dé en rouge.",
	// 		"empty message field":"Le message est vide.",
	// 		"message sent":"Message envoyé",
	// 		"timeout device":"Connexion trop lente.",
	// 		"try again later": "Veuillez réessayer dans quelques instants.",
	// 		"saving":"enregistrement en cours…",
	// 		"changes saved":"Modifications Sauvegardées",
	// 		"changes saved successfully":"Modifications Sauvegardées",
	// 		"password should be at least 8 chars in length":"Le mot de passe doit faire au moins 8 caractères.",
	// 		"password tmaze short":"Le mot de passe est trop court",
	// 		"password changed":"Le mot de passe a été changé",
	// 		"new passwords not match":"Saisissez à nouveau le nouveau mot de passe.",
	// 		"invalid password":"Veuillez vérifier votre ancien mot de passe en respectant les minuscules et les majuscules.",
	// 		"sms message sent":"SMS envoyé(s) avec succès.",
	// 		"sms message sent failed":"Le SMS n'a pas pu être envoyé.",
	// 		"sms invalid message":"Le texte du SMS est invalide.",
	// 		"sms invalid phone numbers":"Numéro(s) de téléphone invalide(s)",
	// 		"list numbers sms failure":"Certains SMS n'ont pu être envoyés.",
	// 		"to change password": "Veuillez changer votre <br/> <b>mot de passe</b>",
	// 		"please check accepted terms": "Veuillez accepter les conditions d'utilisation",
	// 		"please enter a title and an objection": "Veuillez entrer un titre et une objection",
	// 		"the slide has been successfully saved": "Le document a bien été sauvegardé",
	// 		"the contribution has been successfully saved": "La contribution a bien été sauvegardée",
	// 		"the contribution has been successfully made public": "La contribution a bien été rendue publique",
	// 		"the contribution has been successfully made private": "La contribution a bien été rendue privée",
	// 		"the contribution has been successfully published": "La contribution a bien été soumise",
	// 		"the contribution has been successfully unpublished": "La contribution a bien été retirée de la médiation",
	// 		"please enter a description, a link and a reference": "Veuillez entrer une description, un lien et une référence",
	// 		"please enter a title and an objection before adding any slide": "Veuillez entrer un titre et une objection avant d'ajouter un document",
	// 		"please enter a description, a link and a reference before adding any slide": "Veuillez entrer une description, un lien et une référence avant d'ajouter un document",
	// 		"save slide": "sauvegarder le document",
	// 		"add slide": "ajouter un document",
	// 		"delete slide": "supprimer le document",
	// 		"edit contribution":"modifier la contribution",
	// 		"save contribution": "sauvegarder la contribution",
	// 		"remove contribution": "supprimer la contribution",
	// 		"submit": "soumettre à médiation",
	// 		"maintain private": "retirer de la médiation",
	// 		"contact author":"contacter l'auteur",
	// 		"make public":"rendre public",
	// 		"make private":"rendre privé",
	// 		'are you sure you want to delete this document?': "voulez-vous vraiment supprimer ce document ?",
	// 		'are you sure you want to delete this contribution?':'voulez-vous vraiment supprimer cette contribution?',
	// 		'are you sure you want to leave the editor?': "voulez-vous vraiment quitter l'éditeur ?",
	// 		"Title": "Titre",
	// 		"Please give an abstract of your contribution (in less than 500 chars)": "Veuillez fournir un résumé de votre contribution (en moins de 500 signes)",
	// 		"Please explain why this document is relevant (in less than 2500 chars)": "Décrivez l\'intérêt de ce document (en moins de 2500 signes)",
	// 		"Provide the document web link (refer to the help page on the top right corner if needed)": "Indiquez l\'URL où se trouve votre document (cliquez sur le bouton aide en haut à droite pour en savoir plus)",
	// 		"Provide document bibliographic references": "Indiquez la référence bibliographique de votre document",
	// 		// buttons for each element
	// 		"preview": "aperçu",
	// 		"collapse": "replier",
	// 		"explore": "ouvrir",
	// 		"explore_scenarios": "explorer les croisements",
	// 		"open_document": "ouvrir le document"
 //    },
	// 	'en':{
	// 		// buttons for each element
	// 		"explore": "open",
	// 		"explore_scenarios": "explore through crossings",
	// 		// search
	// 		'no results found':"no search result",
	// 		"connection error":"Connection error",
	// 		"warning":"Warning",
	// 		"loading":"loading...",
	// 		"open_document": "open document",
	// 		"add slide": "add document",
 //      		"delete slide": "delete document",
 //      		"save slide": "save document"
	// 	}
	// };


	/*


	    Bibtex
	    ======

	*/
	maze.fn.bibtex = function ( bibtex ){
		var bibjson = bibtex.replace(/^\s+|\s+$/g,'')
			.replace(/(\w+)\s*=\s*\{+/g,"\"$1\": \"")
			.replace(/\}+(?=\s*[,\}+])/g,"\"")
			.replace(/@(\w+)\s*\{([^,]*)/,"{\"bibtext_key\":\"$1\",\"$1\": \"$2\"");
		maze.log( bibjson )
		return JSON.parse(bibjson);
	}


	//maze.fn.unique = function( array ){ var u = {}, a = []; for(var i = 0, l = array.length; i < l; ++i){ if(u.hasOwnProperty(array[i])) { continue; } a.push(array[i]); u[array[i]] = 1;} return a;}

	maze.rpc = {};
  maze.rpc.type = 'POST';
  maze.rpc.contentType = 'application/x-www-form-urlencoded';
  maze.rpc.expect = function(data) {
    return data !== null &&
      typeof data === 'object' &&
      !('error' in data);
  };
  maze.rpc.error = function(data) {
    this.log('Error:' + data);
  };
  maze.rpc.buildData = function(method, params) {
    return JSON.stringify({
      id: 1,
      jsonrpc: '2.0',
      method: method,
      params: params
    });
  };

})( jQuery, window );

