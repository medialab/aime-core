( function( $, w, undefined ){
	'use strict';
	var maze = w.maze;

	maze.story = {};
	maze.story.scene = false;
	maze.events = maze.events || {};
	
	maze.TEXT	= 'TEXT';
	maze.VOC	= 'VOC';
	maze.DOC	= 'DOC';
	maze.COMM	= 'COM';

	maze.COLUMN_LEADER = 'L';
	maze.COLUMN_SLAVE_OPENED = 'S-O';
	maze.COLUMN_SLAVE_CLOSED = 'S-C';
	maze.ITEM_FULL = 'ITEM_FULL';
	maze.ITEM_PREVIEW = 'ITEM_PREVIEW';
	maze.ITEM_CLOSED = 'ITEM_CLOSED';
	maze.ITEM_LIST = 'ITEM_LIST';

	maze.ACTION_CREATE_LEADER = "A"; // there is no previous leading column
	maze.ACTION_CHANGE_LEADER = "B";
	maze.ACTION_STARTUP = "START UP";
	maze.ACTION_LOAD_SCENE = "D";
	maze.ACTION_SET_TEXT_LEADER = "SET TEXT LEADER";
	maze.ACTION_SET_VOC_LEADER = "SET VOC LEADER";
	maze.ACTION_SET_DOC_LEADER = "SET DOC LEADER";
	maze.ACTION_ACTIVATE_ACCOUNT = "activate";

	maze.events.story = {
		"columnify":"MAZE_EVENTS_STORY_COLUMNIFY",
		"collect":"MAZE_EVENTS_STORY_COLLECT", // add maze.engine.Collection object to the current scene ( according to column name VOC, DOC, COMM etc...)
		"lock":"MAZE_EVENTS_STORY_LOCK",
		"unlock":"MAZE_EVENTS_STORY_UNLOCK",
		"call": "MAZE_EVENTS_STORY_CALL", // initialize everything
		"scroll": "MAZE_EVENTS_STORY_SCROLL",
		"explore": "MAZE_EVENTS_STORY_EXPLORE", // event on clicking on something.... do not push story.
		"push": "MAZE_EVENTS_STORY_PUSH",
		"pushed":"MAZE_EVENTS_STORY_PUSHED",
		"change": "MAZE_EVENTS_STORY_CHANGE",
		"changed": "MAZE_EVENTS_STORY_CHANGED",
		"sync": "MAZE_EVENTS_STORY_SYNC",
		"load": "MAZE_EVENTS_STORY_LOAD",
		"store": "MAZE_EVENTS_STORY_STORE",
		"bookmark": "MAZE_EVENTS_STORY_BOOKMARK",
		"bookmarked": "MAZE_EVENTS_STORY_BOOKMARKED",
		"gotopage": "MAZE_EVENTS_STORY_GOTOPAGE",
		"chapter_changed": "MAZE_EVENTS_STORY_CHAPTER_CHANGED",
		"subheading_changed": "MAZE_EVENTS_STORY_SUBHEADING_CHANGED",
		"voc_term_changed": "MAZE_EVENTS_STORY_VOC_TERM_CHANGED",
		"voc_empty": "MAZE_EVENTS_STORY_VOC_IS_EMPTY",
		"doc_document_changed": "MAZE_EVENTS_STORY_DOC_DOCUMENT_CHANGED",
		"doc_empty": "MAZE_EVENTS_STORY_DOC_IS_EMPTY",
		"text_chapter_changed": "MAZE_EVENTS_STORY_TEXT_CHAPTER_CHANGED",
		"text_empty": "MAZE_EVENTS_STORY_TEXT_IS_EMPTY",
		"text_subheading_changed": "MAZE_EVENTS_STORY_TEXT_SUBHEADING_CHANGED"
		
	};
	
	maze.story.init = function(){ maze.log( "[maze.story.init]" );
		for (var i in maze.events.story){
			maze.on( maze.events.story[i],  maze.controllers.story[i] );
		}
	}

	maze.story.clone_current_scene = function(){
		return new maze.story.Scene( maze.story.scene.get_properties() );
	}
	
	maze.story.is_columnable = function( scene ){
		var current_scene = maze.story.scene;
		return scene.action != current_scene.action || scene.column_leading != current_scene.column_leading || scene.column_slave_opened != current_scene.column_slave_opened
	}

	

	/* The Bookmark object */
	maze.story.Bookmark=function(a){
		var b=this;
		this.page=false;
		this.chapter=false;
		this.subheading=false;
		this.paragraph=false;
		this.paragraph_top = false;

		this.jump = false;

		this.get_properties=function(){ var d={};
		for( var c in b ){
			if( typeof b[c] == "function" || b[c] === false){continue;};
			d[c]=b[c];
		} return d; };this.load=function(d){for(var c in d){b[c]=d[c]}};this.load(a)};

	/* The Scene object */
	maze.story.get_scene_from_hash = function( hash ){
		// maze.log( Base64.decode( hash ), JSON.parse( Base64.decode( hash ) ) );
		
		if (hash) {
			try{	

				var properties = JSON.parse( Base64.decode( hash ) );
				if( properties.bookmark ){
					properties.bookmark = new maze.story.Bookmark( properties.bookmark );
					properties.bookmark.jump = true;
					
				}
			} catch( e){
				maze.error( "[maze.story.get_scene_from_hash]", "unable to understand location.hash", e);
				return false;
			}
		} else {
			maze.trigger( maze.events.story.push, new maze.story.Scene({"action": maze.ACTION_STARTUP}) );
		}

		return new maze.story.Scene( properties ) ;// Base64.encode( JSON.stringify(this) );
	};



	maze.story.Scene = function( properties ){
		var _this = this;

		this.column_leading = false; // maze.TEXT | maze.VOC | maze.DOC	| maze.COMM
		this.column_slave_opened = false; // maze.TEXT | maze.VOC | maze.DOC	| maze.COMM
		this.item = false; // item id
		this.item_preview = false; // item id

		// collection objects!
		this.VOC = false;
		this.TEXT = false;
		this.COMM = false;
		this.DOC = false;
		
		this.item_slave_preview = false; 

		this.leading_links = false; // string of leading links
		this.interlinks = false;
		this.links = {}; // dictionary of links / position! 
		this.action = false; // "CHANGE_LEADER"
		this.previous_scene = false;
		this.hash = "";

		// special items
		this.bookmark = false; // object bookmark
		this.term = false; // vocabulary term id selector
		this.doc = false; // document term id selector
		this.comm = false; // comment term id selector

		this.clicked_bookmark = false; // special bookmarlk for clicked links (in TEXT coulmn)

		this.column_leading_item = false; // item full view in column leading


		this.query = false;


		this.get_items = function(){
			if( _this.leading_links === false )
				return {};
			var d = {},
				ls = _this.leading_links === false? []:_this.leading_links.split(/[\s,]+/);

			ls.pop();
			
			for( var i in ls ){
				var parts = ls[i].split("-");
				
				if ( parts.length != 2 )
					continue;
				if( ["vocab", "modes" ].indexOf( parts[0] ) != -1){
					d[ maze.VOC ] = typeof d[ maze.VOC ] == "undefined"? [ parts[1] ]: d[ maze.VOC ].indexOf( parts[1] ) != -1? d[maze.VOC]: d[ maze.VOC ].concat( [ parts[1] ] ); 
				} else if( parts[0] == "doc" ){
					d[ maze.DOC ] = typeof d[ maze.DOC ] == "undefined"? [ parts[1] ]: d[ maze.DOC ].indexOf( parts[1] ) != -1? d[maze.DOC]: d[ maze.DOC ].concat( [ parts[1] ] ); 
				
				}
			}
			return d;
		}

		this.get_interlinks = function(){
			if( _this.interlinks === false )
				return {};
			var d = {},
				ls = _this.interlinks === false? []:_this.interlinks.split(/[\s,]+/);

			
			for( var i in ls ){
				var parts = ls[i].split("-");
				
				if ( parts.length != 2 )
					continue;
				if( ["vocab", "modes" ].indexOf( parts[0] ) != -1){
					d[ maze.VOC ] = typeof d[ maze.VOC ] == "undefined"? [ parts[1] ]: d[ maze.VOC ].indexOf( parts[1] ) != -1? d[maze.VOC]: d[ maze.VOC ].concat( [ parts[1] ] ); 
				} else if( parts[0] == "doc" ){
					d[ maze.DOC ] = typeof d[ maze.DOC ] == "undefined"? [ parts[1] ]: d[ maze.DOC ].indexOf( parts[1] ) != -1? d[maze.DOC]: d[ maze.DOC ].concat( [ parts[1] ] ); 
				
				}
			}
			return d;
		}

		this.get_properties = function(){
			var d = {
				column_leading: _this.column_leading,
				column_slave_opened: _this.column_slave_opened,
				action: _this.action
				
			}

			// TO DO verify object's item
			if( typeof _this.item == "object" ){
				d[ 'item' ] == _this.item.attr('id');
			} else if( typeof _this.item == "string" ){
				d[ 'item' ] = _this.item;
			}

			if( _this.interlinks ){
				d['interlinks'] = _this.interlinks;
			}

			if ( _this.bookmark ){
				try{
					d.bookmark = _this.bookmark.get_properties();
				} catch( e ){
					d.bookmark = _this.bookmark;
				}
				//maze.log( _this.bookmark );
				
			}
			
			if ( _this.term ){
				d.term = _this.term;
			}

			if ( _this.doc ){
				d.doc = _this.doc;
			}

			if(_this.query){
				d.query = _this.query;
			}

			if(_this.item_slave_preview ){
				d.item_slave_preview = _this.item_slave_preview;
			}

			return d;
		}
		
		this.get_hash = function(){
			return Base64.encode( JSON.stringify( _this.get_properties() ) );// Base64.encode( JSON.stringify(this) );
		};

		this.push_hash = function(){
			_this.hash = _this.get_hash();
			location.hash=_this.hash;
			return _this.hash;
		}

		this.load = function( properties ){
			for( var i in properties ){
				_this[i] = properties[i];
			};
			_this.hash = this.get_hash();
			return _this;
		}

		this.load( properties );
	};



})( jQuery, window );
