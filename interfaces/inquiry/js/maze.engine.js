'use strict';
	
( function( $, w, undefined ){
	maze                 = w.maze || {};
	maze.engine          = {};
	maze.engine.template = {};
	maze.engine.parser   = {};
	maze.engine.elements = {};

	maze.engine.init = function() {
		maze.log("[engine.init]");
		maze.currentUserId = $('#wrapper').data('userid'); // currently connected userid

		maze.engine.elements.documents = new maze.engine.Collection({ column:maze.DOC });
		maze.engine.elements.vocabulary = new maze.engine.Collection({ column:maze.VOC });
		maze.engine.elements.book = new maze.engine.Collection({ column:maze.TEXT });
		maze.engine.elements.comments = new maze.engine.Collection({ column:maze.COMM });
	};

	maze.engine.replace = function( object, template, $list ){
		//alert("replacing item");
		//maze.log($list.find( "#" + object.id ) );
		$list.find( "#" + object.id ).replaceWith( maze.engine.template[ template ]( object ) );


	}

	/*
		@return a enriched collection of documents
	*/	
	maze.engine.parser.documents = function(items) {
		return items.map(function(d) {
      if(!d.children.length)
        return d;

      d.references = []; // search for biblib references to prefetch     
      var display_number = 0;
      for(var i in d.children)
        for(var j in d.children[i].children) {
          display_number++; // increment display_number
          d.children[i].children[j].display_number = +display_number;
          if(d.children[i].children[j].type == 'reference'){
            d.references.push(''+d.children[i].children[j].biblib_id);
          } else if(d.children[i].children[j].reference) { // take reference attached to a media object
            d.references.push(''+d.children[i].children[j].reference.biblib_id);
          }
        }  

      // get the first slide as "document preview"
      d.preview = d.children.shift();

      return d;
    });
	}


	/*
		@return a dictionary of listing information.
	*/
	maze.engine.listof = function( objects, template, $list, infinte_scroll ){
		// alert("listof");
		var response = { delay:false };

		var translate = {

			list:{
				chapter: 'book',
				term: 'vocabulary',
				reference: 'documents',
				document: 'documents',
				comment: 'comments'
			},

			prefix:{
				chapter:'',
				term: 'vocab-',
				reference: 'ref-',
				document: 'doc-',
				comment: 'comm-'
			}
		};

		// maze.log("[maze.engine.listof] template:", template, " - list:", translate.list[ template ] ,"- prefix:", translate['prefix'], translate['prefix'][ template ] );

		if( infinte_scroll ){
			for( var i in objects ){
				//if( template == "reference" ){
					//maze.log( objects, maze.engine.template[ template ]( objects[i] ) );
					//alert( "reference here");
				//}

				$list.append( maze.engine.template[ template ]( objects[i] ) );

				maze.engine.elements[ translate.list[ template ] ].push( [ translate.prefix[ template ], objects[i].id ].join("") );
			}
			return response;
		}

		/*
			Change animation
			According to SCENE ACTION
		*/
		var action = maze.story.scene.action;

		if( maze.engine.elements[ translate.list[ template ] ].list.length == 0 ){

			$list.empty();

			for( var i in objects ){
				var id = [ translate.prefix[ template ], objects[i].id ].join("");



				if( maze.engine.elements[ translate.list[ template ] ].list.indexOf( id ) != -1 ) continue;
				$list.append( maze.engine.template[ template ]( objects[i] ) );

				translate.prefix[ template ] == 'vocab-' && maze.move.voc.swipein('#'+id,{delay: i * 150});
				translate.prefix[ template ] == 'doc-' && maze.move.doc.swipein('#'+id,{delay: i * 150});
				translate.prefix[ template ] == 'comm-' && maze.move.doc.swipein('#'+id,{delay: i * 150});
				translate.prefix[ template ] == '' && maze.move.text.chapter.swipein('#'+id,{delay: i * 150});


				maze.engine.elements[ translate.list[ template ] ].push( id );
			}
			response.delay = i * 150;
			return response;
		}

		var stored_elements = maze.engine.elements[ translate.list[ template ] ].list;
		var candidates = [];
		var preceding_element = false;


		/*
			Cycle 1. REMOVE ELEMENTS NO MORE IN SCENE (or do before some animation)
			===
		*/
		var c = 0;
		for( var i in stored_elements ){
			var id = stored_elements[i],
				to_be_removed = true;
			if( typeof id != "string" ){
				maze.log( id, maze.engine.elements[ translate.list[ template ] ].list )
				return;
			}

			for( var j in objects ){ if( [ translate.prefix[ template ], objects[j].id ].join("") == id ){ to_be_removed = false; break; } }

			if( to_be_removed ){
				maze.log("[maze.engine.listof]", template, "removing item #", id );
				translate.prefix[ template ] == 'vocab-' && maze.move.voc.swipeout('#'+id,{delay: c * 150,callback:function( selector ){
					$( selector ).remove();
				},args:['#'+id]});

				translate.prefix[ template ] == 'doc-' && maze.move.doc.swipeout('#'+id,{delay: i * 150,callback:function( selector ){
					$( selector ).remove();
				},args:['#'+id]});

				translate.prefix[ template ] == 'comm-' && maze.move.doc.swipeout('#'+id,{delay: i * 150,callback:function( selector ){
					$( selector ).remove();
				},args:['#'+id]});

				translate.prefix[ template ] == '' && maze.move.text.chapter.swipeout('#'+id,{delay: i * 150,callback:function( selector ){
					$( selector ).remove();
				},args:['#'+id]});

				c++;
				/*
				$( "#" + id ).css("position","relative").stop().animate({left: "-100%"},{
					duration:300,
					complete:function(){ $(this).stop().animate({ height: 0},{ duration:300, complete: function(){ $(this).remove(); }})}
				});
*/
			} else candidates.push( id );
		};


		// maze.log( "[maze.engine.listof]", candidates, objects );
		maze.engine.elements[ translate.list[ template ] ].list = [];

		/*
			Cycle 2. ADD ELEMENTS ACCORDING TO OBJECT ORDER
			===
		*/
		var c = 0;
		for( var i in objects ){
			var id = [ translate.prefix[ template ], objects[i].id ].join("");
			if( maze.engine.elements[ translate.list[ template ] ].list.indexOf( id ) != -1 ) continue;

			maze.engine.elements[ translate.list[ template ] ].push( id );

			// new entries
			if( candidates.indexOf( id ) == -1){

				if( preceding_element === false ){
					$list.prepend( maze.engine.template[ template ]( objects[i] ) );
					translate.prefix[ template ] == 'vocab-' && maze.move.voc.swipein('#'+id,{delay: c * 150});
					translate.prefix[ template ] == 'doc-' && maze.move.doc.swipein('#'+id,{delay: c * 150});
					translate.prefix[ template ] == '' && maze.move.text.chapter.swipein('#'+id,{delay: c * 150});
					preceding_element = id;
					c++;
					continue;
				};

				$("#" + preceding_element).after( $('<div/>').html( maze.engine.template[ template ]( objects[i] )).contents() );
				translate.prefix[ template ] == 'vocab-' && maze.move.voc.swipein('#'+id,{delay: c * 150});
				translate.prefix[ template ] == 'doc-' && maze.move.doc.swipein('#'+id,{delay: c * 150});
				translate.prefix[ template ] == '' && maze.move.text.chapter.swipein('#'+id,{delay: c * 150});

			} else {
				preceding_element = id;
				translate.prefix[ template ] == 'vocab-' && $('#'+id).hasClass('swipedout') && maze.move.voc.swipein('#'+id,{delay: c* 150});
				translate.prefix[ template ] == 'doc-' && $('#'+id).hasClass('swipedout') && maze.move.doc.swipein('#'+id,{delay: c* 150});
				translate.prefix[ template ] == '' && $('#'+id).hasClass('swipedout') && maze.move.text.chapter.swipein('#'+id,{delay: c* 150});
			}

			c++;

			response.delay = c * 150;


		}

		return response;

	}









	//////////////////////
	// 					//
	//		BOOK 		//
	//					//
	//////////////////////

	maze.BOOK = "1";
	maze.CHAPTER = "2";
	maze.SUBHEADING = "3";
	maze.PARAGRAPH = "4";
	maze.MODE = "5"; // not used, included into paragraph object
	maze.VOCABULARY = "6"; // not used cfr paragraph object
	maze.ITALICS = "7"; // not used, cfr paragraph object
	maze.language= "fr";

	/*
		DEPRECATED function
	*/
	maze.engine.parser.book = function(objects) {
		return objects;
	};

	maze.engine.helpers = {}
	maze.engine.helpers.contributions = function( object ){
		var contributions = [];
		// BOOKMARK segment parsing
		if ( typeof object.bookmarks != "undefined" ){
			for( var i in object.bookmarks ){
				contributions.push(object.bookmarks[i][4]);
			}
		}
		return contributions.join(' ');
	}
	maze.engine.helpers.paragraph = function( object ){
		var __paragraph = {
			"id": object.id,
			"slices":[], // the slices
			"type": object.type
		};
		if( typeof object['page'] != "undefined" )
			__paragraph.page = object.page;

		//object.id == "4278" && maze.log('aaaaaa',object,object.splitPoints);
		if( typeof object.splitPoints == "undefined" || object.splitPoints.length == 0 ){
			__paragraph.content = object.content;
			return __paragraph;
		} else {
			__paragraph.content = object.content;
		}

		var segments =[];
		var j, k, m;

		// rebuild splitpoints
		var splitPoints = []

		// italic segments parsing
		// typeof objects[i].italics != "undefined" && maze.log("[maze.engine.parser.book]", objects[i] )
		if ( typeof object.italics != "undefined" ){
			for( j in object.italics ){
				segments.push({
					"t":"italic",
					"id":object.italics[j][3],
					"left": parseInt( object.italics[j][0] ),
					"right": parseInt( object.italics[j][1] )
				});

			}
		}

		// VOCAB segment parsing
		if ( typeof object.vocabs != "undefined" ){
			for( k in object.vocabs ){
				segments.push({
					"t":"vocab",
					"id":object.vocabs[k][4],
					"left": parseInt( object.vocabs[k][0] ),
					"right": parseInt( object.vocabs[k][1] )
				});

			}
		}

		// DOCUMENTS segment parsing
		if ( typeof object.documents != "undefined" ){
			for( k in object.documents ){
				segments.push({
					"t":"doc",
					"id":object.documents[k][4],
					"left": parseInt( object.documents[k][0] ),
					"right": parseInt( object.documents[k][1] )
				});

			}
		}

		//  ES segment parsing
		if ( typeof object.matches != "undefined" ){
			for( k in object.matches ){
				segments.push({
					"t":"match",
					"left": parseInt( object.matches[k][0] ),
					"right": parseInt( object.matches[k][1] )
				});

			}
		}

		// MODES segment parsing
		if ( typeof object.modes != "undefined" ){
			for( m in object.modes ){
				segments.push({
					"t":"modes",
					"id":object.modes[m][5],
					"m":object.modes[m][2],
					"left":parseInt(object.modes[m][0]),
					"right":parseInt(object.modes[m][1])
				});

			}
		}

		// BOOKMARK segment parsing
		if ( typeof object.bookmarks != "undefined" ){
			// maze.log('                   ',object);
			__paragraph.type == 'bookmarked';
      __paragraph.annotated = true;
			for( m in object.bookmarks ){
				segments.push({
					"t": "star",
					"id": object.bookmarks[m][4],
					"left": parseInt(object.bookmarks[m][0]),
					"right": parseInt(object.bookmarks[m][1])
				});

			}
		}

		// SPLITPOINTS cycle
		// push the very last stuff
		// CLEAN splitpoints
		splitPoints = object.splitPoints;// maze.fn.unique( object.splitPoints );
		splitPoints.sort(function(a,b){return a-b>0?1:-1});

		var checkpoint = 0;
		var left, right, slice;

		// maze.log( object.content, splitPoints);
		// for by couples
		for( var n = 0; n < splitPoints.length; n += 2 ){
			left = parseInt( splitPoints[ n ] );
			right = parseInt( splitPoints[ n + 1 ] );
			// slice = object.content.substring( left, right );

			slice = object.content.slice( left, right );

			// before slice
			if( n == 0 && left > 0 ){
				__paragraph.slices.push({ content: object.content.slice(0,left), types:[], left:0, right:left});
			} else if( n > 0 && left - checkpoint > 0 ){
				// maze.log( object.content.slice(checkpoint,left), checkpoint,left, object.content, splitPoints);
				//alert("gap")
				__paragraph.slices.push({ content: object.content.slice(checkpoint,left), types:[], left:checkpoint, right:left});
			}

			__paragraph.slices.push({ content: slice, types:[], left:left, right:right});

			checkpoint = right;
		}

		if( right <  object.content.length ){
			__paragraph.slices.push({ content: object.content.substring(right, object.content.length), types:[], left: right, right:object.content.length });
		}


		/*
			Cycle through slices
		*/
		for( var n = 0; n < __paragraph.slices.length; n++ ){
			var left = __paragraph.slices[n].left;
			var right = __paragraph.slices[n].right;

			for( var o in segments ){
				var in_interval = segments[ o ].left < right && segments[ o ].right > left ;

				// maze.log("check segment" ,segments[ o ], segments[ o ].left ,segments[ o ].right, " in interval ", left, right,  in_interval, splitPoints )


				if( !in_interval ) continue;

				// basic slice type, ie the span class
				var type = {
					"type":  segments[ o ].t, // segment type, i.e "vocab"
					"id": segments[ o ].id, // segment ID
					left:segments[ o ].left,
					right:segments[ o ].right
				};

				if( typeof type.m != "undefined" ){
					type.m = segments[ o ].m;
				}

				__paragraph.slices[n].types.push( type );
			}

			if( __paragraph.slices[n].types.length == 1 && __paragraph.slices[n].types[0].type == 'italic' )
				__paragraph.slices[n].types[0].disable = true;



		};
		// maze.log( "slices", __paragraph.slices );



		return __paragraph;
	}

	// maze.engine.parser.matched_paragraph = function( objects ){
	// 	var counter = 0;
	// 	var paragraphs = {}; // { '<id_paragraph>': {<paragraph object>}, ... }

	// 	for( var i in objects ){
	// 		for( var j in objects[i] ){
	// 			var __obj = objects[i][j];
	// 			counter++;
	// 			// maze.log( __obj );
	// 			paragraphs[ __obj.id ] = maze.engine.helpers.paragraph( __obj );
	// 			paragraphs[ __obj.id ].type = __obj.type;
	// 			paragraphs[ __obj.id ].chapter = __obj.chapter;
	// 			paragraphs[ __obj.id ].subheading = __obj.subhead;
	// 		}

	// 	}
	// 	maze.log("[maze.engine.parser.matched_paragraph]", counter, objects, "objects, paragraphs:", paragraphs)
	// 	return paragraphs;
	// }




	//	""hello hello { Whi­te­head, 1995 #469}".replace"
	maze.engine.parser.reference = function( text ){


		var replaced = text.replace(/{(.*[^#])#(\d+)}/g,function(a,title,id){
			// maze.log(a,title,id);
			return '<span class="link doc" data-id="ref-'+ id.replace(/\s/,'') +'">' + title+ '</span>';
		});

		//maze.log( text,'\n', '\n', replaced,'\n\n');

		// alert( "maze.engine.parser.reference"  );
		return replaced;
	}









	//////////////////////////
	// 						//
	//		VOCABULARY 		//
	//						//
	//////////////////////////

	maze.voc = {};
	maze.voc.NAME = "1";
	maze.voc.SHORT_DEFINITION = "3";
	maze.voc.LONG_DEFINITION = "4";
	maze.voc.DEF_BY_MODES = "5";
	maze.voc.PARAGRAPH = "6";

	maze.engine.parser.vocabulary = function(objects, crossings, light_loading) {
		var obj,
			__vocabulary = {"terms":[]},
			__term,
			__paragraph,
			obj_has_stars = false;


		for( var i=0; i < objects.length; i++ ){

			for( var j=0; j < objects[i].length; j++ ){

				obj = objects[ i ][ j ];

				switch(obj.type){

					case maze.voc.NAME:

						__term = {"name": obj.content, "type": obj.type, id: obj.id, "paragraphs": [], "links": []};

            var crossing_index = crossings.ids.indexOf(obj.id);
            if(crossing_index !== -1)
              __term['crossing'] = crossings.items[crossing_index];

						if ( typeof obj.matches != "undefined" ){
							__term['type'] = "match";
							__term['slices'] = [];

							var splitPoints = obj.splitPoints;// maze.fn.unique( object.splitPoints );
							splitPoints.sort(function(a,b){return a-b>0?1:-1});

							var checkpoint = 0;
							var left, right, slice;

							// maze.log( object.content, splitPoints)
							// for by couples
							for( var n = 0; n < splitPoints.length; n += 2 ){
								left = parseInt( splitPoints[ n ] );
								right = parseInt( splitPoints[ n + 1 ] );
								// slice = object.content.substring( left, right );

								slice = obj.content.slice( left, right );

								// before slice
								if( n == 0 && left > 0 ){
									__term.slices.push({ content: obj.content.slice(0,left), types:[], left:0, right:left});
								} else if( n > 0 && left - checkpoint > 0 ){
									// maze.log( object.content.slice(checkpoint,left), checkpoint,left, object.content, splitPoints);
									//alert("gap")
									__term.slices.push({ content: obj.content.slice(checkpoint,left), types:[], left:checkpoint, right:left});
								}

								__term.slices.push({ content: slice, types:["match"], left:left, right:right});

								checkpoint = right;
							}

							if( right <  obj.content.length ){
								__term.slices.push({ content: obj.content.substring(right, obj.content.length), types:[], left: right, right:obj.content.length });
							}

						}

						__vocabulary.terms.push( __term );
						break;

					case maze.voc.PARAGRAPH:
						// __paragraph = {"content": obj.content, slices:[], type:'', 'number': __term.paragraphs.length + 1 };
						__paragraph = maze.engine.helpers.paragraph( obj );
						__paragraph.id = obj.id;
						__paragraph['number'] = __term.paragraphs.length + 1;

						if( light_loading && __term.paragraphs.length ){
							break
						}
						__term.paragraphs.push( __paragraph );

						if ( typeof obj.matches != "undefined"  || typeof obj.bookmarks != "undefined"  ){
							__term['type'] = "match";
							__paragraph['type'] = "match";
						}

						if ( typeof obj.vocabs != "undefined" ){
							for( var k in obj.vocabs ){
								__term.links.push( "vocab-" + obj.vocabs[k][4] );
							}
						}


					break;

				}
			}
		} // endfor

		// complete list
		// maze.log( "VOCABULARY EME", __vocabulary);

		return __vocabulary
	}










	/*

		ITEMS
	 	=====

	 	Parsers for documents and contributions
	 	aka generic items

		Server side, here is how it works :
			
			DOCUMENT

		const TYPE_DOCUMENT = 0;
		const TYPE_SLIDE = 1;
		const TYPE_TXT = 2;
		const TYPE_CIT = 3;
		const TYPE_PIC = 4;
		const TYPE_VID = 5;
		const TYPE_PDF = 6;
		const TYPE_REF = 7;

			CONTRIBUTION

		const TYPE_BOOKMARK = -1;
		const TYPE_CONTRIBUTION = 0;
		const TYPE_SLIDE = 1;
		const TYPE_TXT = 2;
		const TYPE_CIT = 3;
		const TYPE_URL = 4;
		const TYPE_TXT_REF = 5;
		const TYPE_BIB_REF = 6;
		
	*/
	maze.ITEM_TYPE_BOOKMARK = "-1";
	maze.ITEM_TYPE_TITLE = "0";
	maze.ITEM_TYPE_SLIDE = "1";
	maze.ITEM_TYPE_TEXT = "2";
	maze.ITEM_TYPE_CITATION = "3";
	maze.ITEM_TYPE_MEDIA = "4";
	maze.ITEM_TYPE_VIMEO = "5";
	// Warning ! ITEM_TYPE_VIMEO = 5, means TXT_REF for contributions. see the [switch/case:] below
	maze.ITEM_TYPE_ISSUU = "6";
	maze.ITEM_TYPE_REFERENCE = "7";

	maze.engine.parser.items = function( objects, namespace ){
		var  obj,
			result = {},
			items = [],
			item = {},
			slide = { content:[] },
			obj_has_matches = false,
			obj_annotated = false,
			obj_is_contribution = namespace == "contributions",
			slide_content = '',
			num = 0,
			slide_number = 0;

    	//maze.log('maze.engine.parser.items:',namespace );

		for( var i=0; i < objects.length; i++ ){
			if( objects[ i ][ 0 ].type == maze.ITEM_TYPE_BOOKMARK )
				continue;

			for( var j=0; j < objects[ i ].length; j++ ) {
        		obj = objects[ i ][ j ];

				if( obj.content == null || obj.content == 'frenchContent' || obj.content == 'englishContent')
					continue;

				obj_has_matches = false;
				obj_annotated = false;
				if ( typeof obj.matches != "undefined"  && obj.matches.length ){
					item.type = "match";
					obj_has_matches = true;
				}

    		if(typeof obj.bookmarks != "undefined"  && obj.bookmarks.length) {
      		obj_annotated = true;
        }

				switch( ''+obj.type){
					case maze.ITEM_TYPE_TITLE:
						item = {
							id:  obj.id,
							title:  maze.engine.helpers.paragraph(obj),
							status: +obj.status,
							slides_preview: [],
							slides_opened: [],
							slides_matches: {}, // hash of {<slide index> : <slide>} objets
							arrows: false,
							media: {
								pdf: "pdf-off",
								video: "video-off",
								img: "img-off",
								link: "link-off",
							},
							references:[],
              				inlinks: {}
						};

						var os = +obj.status;
						if( obj.status )
							item.statustr =  os==0 ? 'private' : os==1 ? 'mediated' : 'public';

			            if( obj.date )
			              item.date = obj.date;

			            if( obj.author )
			              item.author = obj.author;
						
						// authorid / belonging are useful to distinguish my contributions from the others'
						item.belonging = 'other';

			          	if( obj.authorid ) {
			          		item.authorid = obj.authorid;
			          		if( item.authorid==maze.currentUserId )
			          			item.belonging = 'mine';
			          	}
			          	// if current user is moderator or admin, he'll also receive mailto field
			          	if( obj.mailto )
			          		item.mailto = obj.mailto;

						if ( typeof obj.matches != "undefined"  || typeof obj.bookmarks != "undefined" ){
							item.type = "match";
						};

            if( typeof obj.incomingLinks != "undefined" ){
              item.flatten = [];
              for( var ii in obj.incomingLinks){
                if(obj.incomingLinks[ii].length)
                  item.flatten.push(
                    ii == 'from_voc'? 'vocab-' + obj.incomingLinks[ii]:
                    ii == 'from_doc'? 'doc-' + obj.incomingLinks[ii]:
                    obj.incomingLinks[ii]
                  );
                item.inlinks[ii] = obj.incomingLinks[ii];
              }
            };
			            //obj.id == "4278" && maze.log('eeeeeeeeee', obj, maze.engine.helpers.paragraph(obj));
						
						item.force_open = item.title.content.match(/\w+, \d+/) != null;
						items.push(item);
						break;

					case maze.ITEM_TYPE_SLIDE:
						slide = {
							id: obj.id,
							slide: j,
							content: [],
							index: slide_number
						};

						if( !item.slides_preview.length ) {
							num = 0;
							item.slides_preview.push( slide );
						} else {
							slide_number++;
							item.slides_opened.push( slide );

						}
						break;

					case maze.ITEM_TYPE_TEXT:
						if (!item.objection)
							item.objection = obj.content;

						num++;
						slide_content = {
							id: obj.id,
							text: {
								content: maze.engine.helpers.paragraph(obj),
								number: num
							}
						};
						if( obj_is_contribution ){
							slide.pertinence = obj.content
						}
						if( obj_has_matches ){
							item.slides_matches[ slide.index ] = slide;
							slide_content.type = 'match';
						}
						if( obj_annotated )
							slide_content.annotated = 	maze.engine.helpers.contributions( obj );

            			slide.content.push( slide_content );
						break;

					case maze.ITEM_TYPE_CITATION:
						num++;
						slide_content = {
							id: obj.id,
							citation: {
								content: maze.engine.helpers.paragraph(obj),
								number: num
							}
						};
						if( obj_has_matches ){
							item.slides_matches[ slide.index ] = slide;
							slide_content.type = 'match';
						}
						if( obj_annotated )
							slide_content.annotated = 	maze.engine.helpers.contributions( obj );

						slide.content.push( slide_content );
						break;
					
					case maze.ITEM_TYPE_MEDIA:
						// CASE FOR CONTRIBUTIONS (MEDIA meaning URL)
						if (namespace === 'contributions') {
							item.media.media = 'media-on';

							// unfortunately, media-type was not in DB
							// (__ todo: store it at contribution's creation !)
							// (__ see backend ContributionItem::getMedia())
							// ... so let's QAD guess what's in there

							var regPdf = /\.pdf$/,
							    regImg = /^<img /,
							    regIframe = /^<iframe /,
							    regVimeo = /vimeo\.com/,
							    regYoutube = /youtube\.com/,
							    guessed_type = 'link';

							if(regPdf.test(obj.content.url)) {
								item.media.pdf = 'pdf-on';
								guessed_type = 'pdf';
							} else if(regImg.test(obj.content.html)) {
								item.media.img = 'img-on';
								guessed_type = 'img';
							} else if( regIframe.test(obj.content.html) && (
										regVimeo.test(obj.content.url) ||
										regYoutube.test(obj.content.url) )
									) {
								item.media.video = 'video-on';
								guessed_type = 'video';
							} else 
								item.media.link = 'link-on';
							
							num++;
							slide_content = {
								id: obj.id,
								media: {
									type: guessed_type,
									html: obj.content.html,
									url: obj.content.url,
									number: num,
									width: obj.width,
									height: obj.height
								}
							};
							if( obj_is_contribution ){
								slide.url = obj.content.url;
								slide.html = obj.content.html;
							}
							if( obj_has_matches ){
								item.slides_matches[ slide.index ] = slide;
								slide_content.type = 'match';
							}
							if( obj_annotated )
								slide_content.annotated = maze.engine.helpers.contributions(obj);

							slide.content.push(slide_content);

						// CASE FOR DOCUMENTS
						} else {
							item.media.img = 'img-on';
							num++;
							slide_content = {
								id: obj.id,
								image: {
									content: obj.content,
									number: num,
									width: obj.width,
									height: obj.height
								}
							};
							if( obj_is_contribution ){
								slide.url = obj.content
							}
							if( obj_has_matches ){
								item.slides_matches[ slide.index ] = slide;
								slide_content.type = 'match';
							}
							if( obj_annotated )
								slide_content.annotated = 	maze.engine.helpers.contributions(obj);

							slide.content.push(slide_content);
						}
						break;

					case maze.ITEM_TYPE_VIMEO:
						num++;
						// Warning ! for contributions, ITEM_TYPE_VIMEO = 5 means TXT_REF !
						if (namespace === 'contributions') {
							// this is a TXT_REF, free text !
							slide_content = {
								id: obj.id,
								reference: {
									content: obj.content,
									number: num
								}
							};
						} else {
							item.media.video = 'video-on';
							slide_content = {
								id: obj.id,
								vimeo: {
									content: obj.content,
									number: num
								}
							};
						}
						
						if( obj_is_contribution ){
							slide.reference = obj.content
						}
						if( obj_has_matches ){
							item.slides_matches[ slide.index ] = slide;
							slide_content.type = 'match';
						}
						if( obj_annotated )
							slide_content.annotated = 	maze.engine.helpers.contributions( obj );

						slide.content.push( slide_content );
						break;

					case maze.ITEM_TYPE_ISSUU:
						item.media.pdf = 'pdf-on';
						num++;
						slide_content = {
							id: obj.id,
							issuu: {
								content: obj.content,
								number: num
							}
						};
						if( obj_has_matches ){
							item.slides_matches[ slide.index ] = slide;
							slide_content.type = 'match';
						}
						if( obj_annotated )
							slide_content.annotated = 	maze.engine.helpers.contributions( obj );

						slide.content.push( slide_content );
						break;

					case maze.ITEM_TYPE_REFERENCE:
						num++;
						slide_content = {
							id: obj.id,
							reference: {
								content: obj.content,
								number: num,
								id:obj.id
							}
						};
						if( obj_has_matches ){
							item.slides_matches[ slide.index ] = slide;
							slide_content.type = 'match';
						}
						if( obj_annotated )
							slide_content.annotated = maze.engine.helpers.contributions( obj );
						slide.content.push( slide_content );
						item.references.push( obj.content );
						//maze.log(doc);
						break;
				}

				// ! WARNING, THIS IS SUPER HEAVY !

				// here we will check/modify the order of the slides if contribution
				// we want it to ALWAYS be: [1'text',2'media',3'reference']
				// ... not regarding if some of those fields are absent
				// 'cause we may have a weird order based on which was saved first on back-end!
				if(obj_is_contribution) {
					if(slide.content) {
						var slides_elems = [];
						var numberstart = 99;
						var keys = [];
						['text','media','reference'].forEach( function(st) {
							slide.content.forEach( function(sl) {
								if(sl.hasOwnProperty(st)) {
									slides_elems.push(sl);
									// we will also reajust number(s) -i- bullets
									keys.push(st);
									numberstart = Math.min(numberstart,+sl[st].number);
								}
							});
						});
						for(var kk in keys) {
							slides_elems[kk][keys[kk]].number = +numberstart+(+kk);
						}
						slide.content = slides_elems;
					}
				}

		        if(obj_annotated) {
		        	item.type = "match";
		        	if( !item.inlinks['from_cont'] ) {
		        		item.inlinks['from_cont'] = [];
		        	}
			        for( var b in obj.bookmarks)
			        	item.inlinks.from_cont.push(obj.bookmarks[b][4]);
	        	};

        	// i == 0 && maze.log('    obj', obj);
			}

	      	if( !item.slides_preview.length )
	        	item.slides_preview.push( slide );

			//i == 0 && maze.log('    sample', namespace, 'item created:', item.title.content, 'id:', item.id);
			item.arrows = item.slides_opened.length > 1;
		}
		result[namespace] = items;
		return result;
	}

	maze.engine.parser.contributions = function( objects ){
		return maze.engine.parser.items( objects, 'contributions');
	}






	/*

		A prototype for list emelents. @todo
		===


	*/
	maze.engine.Collection = function( properties ){

		var b=this;

		this.status = maze.ENGINE_ELEMENT_STATUS_STARTUP;
		this.offset = 0;
		this.limit = 40;

		this.max_offset_reached = false;

		this.column = "untitled";
		this.list = [];
		this.item = false; // used for bookmarking ! :D use complete css id selector here, i.e #voc-2345

		this.length = function(){
			return b.list.length;
		}
		this.empty = function(){
			b.list = [];
		}
		this.push = function(){
			maze.fn.wait( maze.trigger, {delay:500,id:'collection-'+b.column,args:[maze.events.story.collect, b]});
			b.list.push.apply( b.list, arguments );

		}

		this.get_properties=function(){ var d={};for( var c in b ){if( typeof b[c] == "function" || b[c] === false || maze.fn.is_array(b[c]) ){continue;};d[c]=b[c];} return d; };
		this.load=function(d){for(var c in d){b[c]=d[c]}};

		this.load( properties );
	};

	maze.engine.lists = {};

	/*

		STATUS
		===


	*/

	maze.ENGINE_STATUS_STARTUP = 'STARTUP';
	maze.ENGINE_STATUS_READY = 'READY';

	maze.ENGINE_ELEMENT_STATUS_STARTUP = 'STARTUP';
	maze.ENGINE_ELEMENT_STATUS_CALLING = 'CALLING';
	maze.ENGINE_ELEMENT_STATUS_READY = 'READY';


	maze.engine.status = maze.ENGINE_STATUS_STARTUP;

	/*

		ELEMENTS
		===

		LISTS of real elements in place, basically array of ids.

	*/


	maze.engine.is_ready = function(){

		return	maze.engine.elements.documents.status == maze.ENGINE_ELEMENT_STATUS_READY &&
			maze.engine.elements.vocabulary.status == maze.ENGINE_ELEMENT_STATUS_READY &&
			maze.engine.elements.book.status == maze.ENGINE_ELEMENT_STATUS_READY;
	}

	maze.engine.clean = function(){
		maze.engine.elements.documents.status = maze.ENGINE_ELEMENT_STATUS_STARTUP
		maze.engine.elements.vocabulary.status = maze.ENGINE_ELEMENT_STATUS_STARTUP
		maze.engine.elements.book.status = maze.ENGINE_ELEMENT_STATUS_STARTUP
	}


	maze.engine.event = {}

	maze.events.engine = {
		sync:"MAZE_EVENTS_ENGINE_SYNC",
		loaded: "MAZE_EVENTS_ENGINE_LOADED", // something has been loaded.
		book_load:"MAZE_EVENTS_ENGINE_BOOK_LOAD",
		book_loaded:"MAZE_EVENTS_ENGINE_BOOK_LOADED",
		vocabulary_load:"MAZE_EVENTS_ENGINE_VOCABULARY_LOAD",
		vocabulary_loaded:"MAZE_EVENTS_ENGINE_VOCABULARY_LOADED"
	}

})( jQuery, window);
