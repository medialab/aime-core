( function( $, w, undefined ){ var maze = w.maze || {}; maze.move = maze.move || {};
	'use strict';

	maze.move.text = {
		duration:function( distance ){
			return Math.min( 750, Math.max( 350, distance / 0.6))
		},
		easing:"easeInOutQuad",
		preview_height:220
	};

	maze.move.text.set_leader = maze.move.factory(function(scene, next, complete ){


		maze.move.fadeout( maze.vars.static_chapter );
		maze.move.fadeout( maze.vars.static_subheading );
		maze.move.fadeout( maze.columns.text,{
			callback:maze.move.columns.empty,
			args:[
				maze.controllers.scroll.boxes.voc,{
				callback:maze.move.columns.empty,
				args:[ maze.controllers.scroll.boxes.doc,{
					callback:maze.move.columns.adjust,
					args:[ scene,{
						callback:maze.move.text.chapter.show,
						args:[ scene.bookmark.chapter,{
							callback: maze.move.text.subheading.open,
							args:[ scene.bookmark.subheading, {
								callback:maze.move.text.subheading.scrollto,
								args:[ scene.bookmark.subheading, { callback:function(){
									maze.move.fadein( maze.columns.text );
									maze.trigger(maze.events.story.store, scene);
									maze.controllers.scroll.leading.text();
									maze.move.fadein( maze.vars.static_chapter );
									maze.move.fadein( maze.vars.static_subheading );
								}}]}
							]
						}]
					}]
				}]
			}]

		});
	});

	maze.move.text.scrollto = maze.move.factory(function(el, next, complete ){
		var wrapper = el.closest(".wrapper"),
      scrolltop = wrapper.scrollTop() + el.position().top ,
			delta = Math.abs( wrapper.scrollTop() - scrolltop );
			duration = typeof next != "undefined" && typeof next.duration == "number"? next.duration: maze.move.text.duration( delta );

		wrapper.stop().animate({scrollTop: scrolltop},{
			duration: duration,
			easing:maze.move.text.easing,
			complete: complete
		});

	});





	maze.move.text.chapter = { duration:550, easing:"easeInOutQuint" };



	maze.move.text.chapter.toggle_preview = maze.move.factory(function(el, next, complete ){
		el.hasClass('preview')? maze.move.text.chapter.hide( el, { callback:complete }):maze.move.text.chapter.show( el, { callback:maze.move.text.scrollto, args:[ el, { callback:complete } ] } );
	});

	maze.move.text.chapter.toggle_static_preview = maze.move.factory(function(el, next, complete ){
		//el.hasClass('preview')? maze.move.text.chapter.hide( el, { callback:complete }):maze.move.text.chapter.show( el, { callback:maze.move.text.chapter.scrollto, args:[ el, { callback:complete } ] } );

		el.hasClass('preview')? maze.move.text.chapter.scrollto( el, { callback:maze.move.text.chapter.hide, args:[ el, { callback:complete }] }):maze.move.text.chapter.show( el, { callback:maze.move.text.chapter.scrollto, args:[ el, { callback:complete } ] } );
	});

	maze.move.text.chapter.show = maze.move.factory( function(el, next, complete ){

		if( el.hasClass("preview") ){
			complete();
			return;
		}

		var subtitles =  el.find(".subtitles").first(),
			duration = maze.move.text.duration( subtitles.outerHeight() );

		el.addClass("preview");

		subtitles.slideDown({
			easing:maze.move.text.easing,
			duration:duration,
			queue:false,
			complete:complete
		});

	});

	maze.move.text.chapter.hide = maze.move.factory(function(el, next, complete ){


		var subtitles =  el.find(".subtitles").first();

		el.removeClass("preview")

		subtitles.slideUp({
			easing:maze.move.text.chapter.easing,
			duration: maze.move.text.duration( subtitles.outerHeight() ) ,
			queue:false,
			complete:complete
		});

	});

	maze.move.text.chapter.swipeout = maze.move.factory(function(el, next, complete ){
		var w = el.outerWidth(), h = el.outerHeight();
		if( el.hasClass('preview') ){
			maze.move.text.chapter.hide( el, {callback:maze.move.text.chapter.swipeout, args:[ el, {callback:complete} ]});
			return
		}

		el.stop().delay( next.delay?next.delay:0 )
			.addClass("swipedout")
			.animate({'opacity':0},{easing:maze.move.text.chapter.easing,duration:450 })
			.animate({'margin-top':-h},{easing:maze.move.text.chapter.easing,duration:350 , complete: complete});
	});

	maze.move.text.chapter.swipein = maze.move.factory(function(el, next, complete ){

		var w = el.outerWidth(), h = el.outerHeight();
		el.css({opacity:0,'margin-top': -h}).removeClass("swipedout");

		el.stop().delay( next.delay?next.delay:0 )
			.animate({'margin-top':0},{easing:maze.move.text.chapter.easing,duration:450 })
			.animate({'opacity':1},{easing:maze.move.text.chapter.easing,duration:350 , complete: complete});
	});


	/*


		SUBHEADING animators
		====================

	*/
	maze.move.text.subheading = {};

	maze.move.text.subheading.scrollto = maze.move.factory(function(el, options, complete ){
		var wrapper = el.closest(".wrapper"),
      scrolltop = wrapper.scrollTop() + el.position().top - el.parent().prev().height(),
			delta,
      options = options || {},
      target = options.target || false,
			paragraph = typeof options != "undefined" && typeof options.paragraph == "string" && options.paragraph != "#undefined"? $(options.paragraph): false,
      offset = options.offset || 0;

		if(paragraph)
			scrolltop += paragraph.position().top;

    if(offset)
      scrolltop += offset;

    if(target)
      scrolltop += target.position().top;

		delta = Math.abs( wrapper.scrollTop() - scrolltop );

		wrapper.stop().animate({scrollTop: scrolltop},{
			duration:maze.move.text.duration( delta ),
			easing:maze.move.text.easing,
			complete: complete
		});

	});

	maze.move.text.subheading.toggle_preview = maze.move.text.subheading.toggle_static_preview = maze.move.factory(function(el, next, complete ){
		el.hasClass('preview')? maze.move.text.subheading.hide( el, { callback:complete }):maze.move.text.subheading.show( el, { callback:maze.move.text.subheading.scrollto, args:[ el, { callback:complete } ] } );
	});



	maze.move.text.subheading.show = maze.move.factory(function(el, next, complete ){
		if( next.callback && (el.hasClass("preview") || el.hasClass("opened"))) {
			return next.callback.apply(this, next.args );
		}

		var paragraphs = el.find(".paragraphs"),
				ellipsis = el.find(".ellipsis"),
				height = Math.min( paragraphs.outerHeight(), maze.move.text.preview_height );

		el.addClass("preview");

		paragraphs
			.css({
				height: height
			})
			.slideDown({
				easing:maze.move.text.easing,
				duration:maze.move.text.duration(height),
				queue:false,
				complete:complete
			});

		maze.move.ellipsis.show( ellipsis );
	});



	maze.move.text.subheading.hide = maze.move.factory(function(el, next, complete ){
		if( !el.hasClass("preview") ){
			complete();
			return;
		}
		var paragraphs = el.find(".paragraphs"),
				ellipsis = el.find(".ellipsis"),
				height = paragraphs.height();

		el.removeClass("preview");

		paragraphs
			.slideUp({
				easing:maze.move.text.easing,
				duration:maze.move.text.duration(height),
				queue:false,
				complete:function(){
					paragraphs.css({
						height: 'auto'
					})
          el.removeClass("opened");
					complete();
				}
			});

		maze.move.ellipsis.hide( ellipsis );
	});


	maze.move.text.subheading.toggle_open = maze.move.factory(function(el, next, complete ){
		el.hasClass('opened')? maze.move.text.subheading.close( el, { callback:complete }):maze.move.text.subheading.open( el, { callback:maze.move.text.subheading.scrollto, args:[ el, { callback:complete } ] } );
	});

	maze.move.text.subheading.open = maze.move.factory(function(el, next, complete ){
		if(el.hasClass('opened')){
			complete();
			return;
		}

		var paragraphs =  el.find(".paragraphs"),
				ellipsis = el.find(".ellipsis"),
				height = paragraphs[0].scrollHeight;

		el.addClass('opened');
		maze.move.ellipsis.hide( ellipsis );
		paragraphs.slideDown({
				easing:maze.move.text.easing,
				duration:maze.move.text.duration(height),
				queue:false,
				complete:complete
		});
		return;
		var paragraphs =  el.find(".paragraphs");

		if( !el.hasClass('preview') ){
			var height = paragraphs.outerHeight();

			paragraphs.slideDown({
				easing:maze.move.text.easing,
				duration:maze.move.text.duration(height),
				queue:false,
				complete:function(){
					el.addClass('opened');
					complete();
				}
			});
		} else {


			paragraphs.slideDown({easing:maze.move.text.easing, duration:500,queue:false, complete:complete});

		}
	});

	maze.move.text.subheading.close = maze.move.factory(function(el, next, complete ){

		var paragraphs =  el.find(".paragraphs"),
			ellipsis = el.find(".ellipsis").hide().css({bottom:-100}),
			height = paragraphs.outerHeight();


		paragraphs.slideUp({
			easing:maze.move.text.easing,
			duration:maze.move.text.duration(height),
			queue:false,
			complete:function(){ el.removeClass("preview opened");}
		});
	});

	/*


		PARAGRAPH animators
		===================

	*/
	maze.move.text.paragraph = {};
	maze.move.text.paragraph.scrollto = maze.move.factory(function(el, next, complete ){ /*
		var subheading_top = el.parent().parent().position().top,
			scrolltop = maze.columns.text.find(".wrapper").scrollTop() + subheading_top + el.position().top - el.parent().parent().prev().height() - el.parent().parent().parent().parent().prev().height() ;
			delta = Math.abs( maze.columns.text.find(".wrapper").scrollTop() - scrolltop );

		maze.columns.text.stop().animate({scrollTop: scrolltop},{
			duration:maze.move.text.duration( delta ),
			easing:maze.move.text.easing,
			complete: complete
		});
    */
	});


	/*
		Note: you can pass to next object animation properties like delay or duration.
		Such properties must be implemented inside atomic functions.
	*/
	maze.move.text.bookmark = maze.move.factory(function(scene, next, complete ){
		var duration = next && typeof next.duration == "number"? next.duration: false;

		if( scene.bookmark && scene.bookmark.chapter && !scene.bookmark.subheading ){

			// 1. Just open chapter

			maze.move.text.scrollto( scene.bookmark.chapter,{
				callback: maze.move.text.chapter.show,
				args:[ scene.bookmark.chapter, {
					callback:complete
				}]
			});

		} else if( scene.bookmark && scene.bookmark.chapter && scene.bookmark.subheading && !scene.bookmark.paragraph ){

			// 2. Just open subheading in preview

			maze.move.text.chapter.show( scene.bookmark.chapter,{
				callback:maze.move.text.subheading.show,
				args:[ scene.bookmark.subheading,{
					callback:maze.move.text.subheading.scrollto,
					args:[ scene.bookmark.subheading,{
						callback:complete
					}]
				}]

			});

		} else if ( scene.bookmark && scene.bookmark.chapter && scene.bookmark.subheading && scene.bookmark.paragraph ){

			// 3. Full open subheading, and then scroll to paragraph
			maze.move.text.scrollto( scene.bookmark.chapter,{
				duration: duration,
				callback: maze.move.text.chapter.show,
				args:[ scene.bookmark.chapter, {
					callback:maze.move.text.subheading.open,
					args:[ scene.bookmark.subheading,{
						callback:maze.move.text.paragraph.scrollto,
						args:[ scene.bookmark.paragraph,{
							callback:complete
						} ]
					}]
				}]
			});

		}
	});

	/*

		Toggle COLLAPSED
		---
		For Slave_opened, notebook and search columns
		Toggle .collapsed classes

	*/
	maze.move.text.chapter.toggle_collapsed = maze.move.factory(function(el, next, complete ){
		el.hasClass('collapsed')? maze.move.text.chapter.show_collapsed( el, { callback:maze.move.text.scrollto, args:[ el, { callback:complete } ] } ):maze.move.text.chapter.hide_collapsed( el, { callback:complete });
	});

	maze.move.text.chapter.toggle_static_collapsed = maze.move.factory(function(el, next, complete ){
		el.hasClass('collapsed')? maze.move.voc.show_collapsed( el, { callback:maze.move.voc.scrollto, args:[ el, { callback:complete } ] } ):maze.move.voc.scrollto( el, { callback:maze.move.voc.hide_collapsed, args:[ el, {callback:complete}] });
	});

	maze.move.text.chapter.show_collapsed =  maze.move.factory(function(el, next, complete ){

		var subtitles =  el.find(".subtitles").first(),
			height = subtitles.outerHeight();

		subtitles.slideDown({
			easing:maze.move.voc.easing,
			duration:maze.move.voc.duration(height),
			complete:function(){
				el.removeClass("collapsed");
				complete();
			}
		});

	});


	maze.move.text.chapter.hide_collapsed = maze.move.factory(function(el, next, complete ){
		var subtitles =  el.find(".subtitles").first(),
			height = subtitles.outerHeight();

		subtitles.slideUp({
			easing:maze.move.voc.easing,
			duration:maze.move.voc.duration(height),
			complete:function(){
				el.addClass("collapsed");
				complete();
			}
		});

	});

	maze.move.text.subheading.toggle_collapsed = maze.move.factory(function(el, next, complete ){
		el.hasClass('collapsed')? maze.move.text.subheading.show_collapsed( el, { callback:maze.move.text.subheading.scrollto, args:[ el, { callback:complete } ] } ):maze.move.text.subheading.hide_collapsed( el, { callback:complete });
	});

	maze.move.text.subheading.show_collapsed =  maze.move.factory(function(el, next, complete ){

		var paragraphs =  el.find(".paragraphs").first(),
			height = paragraphs.outerHeight();

		paragraphs.slideDown({
			easing:maze.move.voc.easing,
			duration:maze.move.voc.duration(height),
			complete:function(){
				el.removeClass("collapsed");
				complete();
			}
		});

	});


	maze.move.text.subheading.hide_collapsed = maze.move.factory(function(el, next, complete ){
		var paragraphs =  el.find(".paragraphs").first(),
			height = paragraphs.outerHeight();

		paragraphs.slideUp({
			easing:maze.move.voc.easing,
			duration:maze.move.voc.duration(height),
			complete:function(){
				el.addClass("collapsed");
				complete();
			}
		});

	});

})( jQuery, window);
