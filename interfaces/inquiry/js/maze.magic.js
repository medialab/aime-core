( function( $, w, undefined ){
	'use strict';
	var maze = w.maze || {};

	maze.magic = {};
	maze.magic.book = {};
	maze.magic.vocabulary = {};
	maze.magic.documents = {};
	maze.magic.comments = {};

	

	maze.magic.book.get = function( result ){
		
		var data = maze.engine.parser.book(result);
		
		// do not insert the very irst chapter (is the book introduction)
		data.chapters.shift();
		var response = maze.engine.listof(data.chapters, "chapter", $("td#column-text .box"));

		// computate total delay (from animation behaviour) then trigger
		maze.engine.elements.book.status = maze.ENGINE_ELEMENT_STATUS_READY;
		
		maze.log('[maze.magic.book.get] will trigger ', maze.events.engine.loaded, 'in ms' ,response.delay)
		maze.trigger( maze.events.engine.loaded,{caller:"maze.magic.book.get", delay:response.delay});
		
	};
	
	maze.magic.book.fetch = function( result ){
		maze.log("[maze.magic.book.fetch] BOOK WASN'T LOADED")
		var data = maze.engine.parser.book(result);
		
		// do not insert the very irst chapter (is the book introduction)
		data.chapters.shift();
		maze.engine.listof(data.chapters, "chapter", $("td#column-text .box"));

		// do book search
		var query = maze.story.scene.query;

		query.length > 2 && maze.api.book.search({query: query });
		// maze.trigger( maze.events.engine.sync );
	
	};


	maze.magic.book.search = function( result ){
		maze.log('[maze.magic.book.search]', result.length, 'paragraphs matches' )
		// var data = maze.engine.parser.matched_paragraph(result);

		var $list = $("#column-text .box");
		$list.find(".match").removeClass("match");
		// clean highlight result
		$list.find("span.highlight").each(function(){
			var p = this.parentNode;
			p.replaceChild(p.firstChild, p);
			p.normalize();
		});


		for( var i in result ){
			if( result[i].type == maze.PARAGRAPH ){
				//maze.log( $("#" + result[i].id ) )
				

				$("#" + result[i].id ).addClass("match")
					.parent().addClass("match")
					.parent().addClass("match")
					.parent().addClass("match")
					.parent().addClass("match");
				// $("#37007").addClass("match").parent().show().parent().addClass("match").parent().show().parent().addClass("match")
				continue;
			} 
			if( result[i].type == maze.CHAPTER ){
				$("#" + result[i].id ).addClass("match")
				continue;
			}

			$("#" + result[i].id ).addClass("match").parent().parent().addClass("match")
			
			
		}
		var query = maze.story.scene.query;
		
		$list.highlight( query );

		// maze.engine.template.matched_paragraph
		// do not insert the very irst chapter (is the book introduction)
		
		//maze.engine.listof(data.chapters, "chapter", $("td#column-text .box"));

		maze.engine.elements.book.status = maze.ENGINE_ELEMENT_STATUS_READY;
		maze.trigger( maze.events.engine.loaded, {caller:"maze.magic.book.search"} );
	
	};

	maze.magic.vocabulary.list = function( result ){
		// maze.log( typeof result[0] );
		if( result == null ) return;
		var data = maze.engine.parser.vocabulary(result, true );
		maze.log('[maze.magic.vocabulary.list]', data);
		maze.engine.listof(data.terms, "term", $("#column-voc .box"));

		maze.engine.elements.vocabulary.status = maze.ENGINE_ELEMENT_STATUS_READY;
		maze.trigger( maze.events.engine.loaded, {caller:"maze.magic.vocabulary.list"} );
	};


	maze.magic.vocabulary.search = function( result ){
		var data = maze.engine.parser.vocabulary(result );
		
		maze.engine.listof(data.terms, "term", $("#column-voc .box"));
		maze.engine.elements.vocabulary.status = maze.ENGINE_ELEMENT_STATUS_READY;

		maze.trigger( maze.events.engine.loaded, {caller:"maze.magic.vocabulary.search"} );
	};


	maze.magic.vocabulary.get = function( result ){
		var data = maze.engine.parser.vocabulary(result);
		maze.log('[maze.magic.vocabulary.get]', data);

		var response =  maze.engine.listof(data.terms, "term", $("#column-voc >div.box"));
		maze.engine.elements.vocabulary.status = maze.ENGINE_ELEMENT_STATUS_READY;

	};

	maze.magic.vocabulary.fetch = function( result ){
		maze.magic.vocabulary.get( result );
		maze.trigger( maze.events.engine.loaded, {caller:"maze.magic.vocabulary.fetch"});
	};

	maze.magic.vocabulary.infinite = function( result ){
		var data = maze.engine.parser.vocabulary(result, true );
		maze.log('[maze.magic.vocabulary.infinite]', data);
		maze.engine.listof(data.terms, "term", $("#column-voc >div.box"), true);
		maze.engine.elements.vocabulary.status = maze.ENGINE_ELEMENT_STATUS_READY;

	};

	maze.magic.documents.list = function( result ){
		var data = maze.engine.parser.documents(result, true);
		maze.log('[maze.magic.documents.list]', data);
		maze.engine.listof(data.documents, "document", $("td#column-doc >div.box"));

		maze.engine.elements.documents.status = maze.ENGINE_ELEMENT_STATUS_READY;
		maze.trigger( maze.events.engine.loaded,{caller:"maze.magic.documents.list"} );
	};

	maze.magic.documents.fetch = function( result ){
		var data = maze.engine.parser.documents(result);
		maze.log('[maze.magic.documents.fetch]', data);
		maze.engine.listof(data.documents, "document", $("#column-doc .box"));
		maze.engine.elements.documents.status = maze.ENGINE_ELEMENT_STATUS_READY;
		maze.trigger( maze.events.story.pushed );
	};

	maze.magic.documents.infinite = function( result ){
		var data = maze.engine.parser.documents(result, true);
		maze.log('[maze.magic.documents.infinite]', data);
		maze.engine.listof(data.documents, "document", $("td#column-doc >div.box"), true);

		maze.engine.elements.documents.status = maze.ENGINE_ELEMENT_STATUS_READY;

	};

	maze.magic.documents.get = function( result ){
		var data = maze.engine.parser.documents(result);
		maze.log('[maze.magic.documents.get]', data);
		maze.engine.listof(data.documents, "document", $("td#column-doc >div.box"));

		// load some stuff
		maze.controllers.scroll.boxes.doc.find(".ref").each( function(i, e){
			var reference_id = $(this).attr("data-id");
			//maze.log('--- reference_id', reference_id)
			maze.api.reference.get( reference_id );
		});
				

		maze.engine.elements.documents.status = maze.ENGINE_ELEMENT_STATUS_READY;
		// maze.trigger( maze.events.engine.loaded,{caller:"maze.magic.documents.get"} );
	};

	maze.magic.documents.failed = function( error ){
		maze.log('maze.magic.documents.failed', error)
		maze.engine.elements.documents.status = maze.ENGINE_ELEMENT_STATUS_READY;
	}






	maze.magic.comments.list = function( result ){
		var data = maze.engine.parser.comments(result, true);
		maze.log('[maze.magic.comments.list]', data);

		// When the new APIs will be available, chenge data.documents with data.comments
		
		maze.engine.listof(data.documents, "comment", $("td#column-comm >div.box"));

		maze.engine.elements.comments.status = maze.ENGINE_ELEMENT_STATUS_READY;
		maze.trigger( maze.events.engine.loaded,{caller:"maze.magic.comments.list"} );
	};

	maze.magic.comments.fetch = function( result ){
		var data = maze.engine.parser.comments(result);
		maze.log('[maze.magic.comments.fetch]', data);
		maze.engine.listof(data.comments, "comment", $("td#column-comm .box"));
		maze.engine.elements.comments.status = maze.ENGINE_ELEMENT_STATUS_READY;
		maze.trigger( maze.events.story.pushed );
	};

	maze.magic.comments.infinite = function( result ){
		var data = maze.engine.parser.comments(result, true);
		maze.log('[maze.magic.comments.infinite]', data);
		maze.engine.listof(data.comments, "comment", $("td#column-comm >div.box"), true);

		maze.engine.elements.comments.status = maze.ENGINE_ELEMENT_STATUS_READY;

	};

	maze.magic.comments.get = function( result ){
		var data = maze.engine.parser.comments(result);
		maze.log('[maze.magic.comments.get]', data);
		maze.engine.listof(data.comments, "comment", $("td#column-comm >div.box"));

		// load some stuff
		maze.controllers.scroll.boxes.comm.find(".ref").each( function(i, e){
			var reference_id = $(this).attr("data-id");
			//maze.log('--- reference_id', reference_id)
			maze.api.reference.get( reference_id );
		});
				

		maze.engine.elements.comments.status = maze.ENGINE_ELEMENT_STATUS_READY;
		// maze.trigger( maze.events.engine.loaded,{caller:"maze.magic.comments.get"} );
	};

	maze.magic.comments.failed = function( error ){
		maze.log('maze.magic.comments.failed', error)
		maze.engine.elements.comments.status = maze.ENGINE_ELEMENT_STATUS_READY;
	}









	/*

		REFERENCES
		===

	*/
	maze.api.reference = {};
	maze.api.reference.get = function( id ){
        $.jsonRPC.request("citation_by_rec_ids", {
            params : [ [ id ], "mla","html" ],
            success : function(result){
            	maze.magic.reference.get( result, id);
    			//maze.log('-------------------------', id, result)
            },
            error : function(data) {maze.error("[maze.api.reference.get]",JSON.stringify(data));}
        });
    }

    maze.api.reference.list = function( ids ){
    	


    		// return

    		// maze.log('§§§§§§§§§§§§§§§§ ', i)

    		// Success to modify with Julien

	        $.jsonRPC.request("citation_by_rec_ids", {
	            params : [ ids , "mla","html" ],
	            success : function(result){
	            	var docs=new Array();
	            	results=eval(result.result);
	            	for( var i in results ){
						result=results[i];
	            		//maze.log('-------------------------',result, result["rec_id"], "[data-id=ref-"+result["rec_id"]+"]");
	            		docs.push({id: result["rec_id"], title: $("[data-id=ref-"+result["rec_id"]+"]").text(), mla: result["mla"] });
	            		
	            	}
	            	maze.engine.listof(docs, "reference", $("#column-doc >div.box") ); 
	            },
	            error : function(data) {alert(JSON.stringify(data));}
	        });
    	
    }

    maze.magic.reference = {};
    maze.magic.reference.get = function( result, selector ){
    	try{
    	var obj = $.parseJSON( result.result.substr(1, result.result.length-2) );
    	// maze.log('§§§§§§§§§§§§§§§§ ', obj );
    	$("[data-ref=ref-"+selector+"]").html( obj.mla );
    	} catch( e ){
    		maze.error( e, selector, result );
    	}
    }






})( jQuery, window);
