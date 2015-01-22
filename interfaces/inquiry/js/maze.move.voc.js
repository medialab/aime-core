( function( $, w, undefined ){ var maze = w.maze || {};
	'use strict';

	maze.move.voc = {
		duration:function( distance ){
			return Math.min( 750, Math.max( 350, distance / 0.6))
		},
		easing:"easeInOutQuad",
		preview_height: 180
	};


	maze.move.voc.enter = maze.move.factory(function(el, next, complete ){
		maze.columns.voc.find(".term:not(#"+ el.attr("id")+")").remove()
		next.callback.apply(this, next.args );
	});


	maze.move.voc.toggle_preview = maze.move.factory(function(el, next, complete ){
		el.hasClass('preview')? maze.move.voc.hide( el, { callback:complete }):maze.move.voc.show( el, { callback:maze.move.voc.scrollto, args:[ el, { callback:complete } ] } );
	});

	maze.move.voc.toggle_static_preview = maze.move.factory(function(el, next, complete ){
		el.hasClass('preview')? maze.move.voc.scrollto( el, { callback:maze.move.voc.hide, args:[ el, {callback:complete}] }):maze.move.voc.show( el, { callback:maze.move.voc.scrollto, args:[ el, { callback:complete } ] } );
	});

	maze.move.voc.scrollto = maze.move.factory(function(el, next, complete ){

		var scrolltop = maze.columns.voc.scrollTop() + el.position().top,
			delta = Math.abs( maze.columns.voc.scrollTop() - scrolltop );

		maze.log( el, 'maze.move.voc.scrollto',delta )
		maze.columns.voc.stop().animate({scrollTop: scrolltop},{
			duration:maze.move.voc.duration( delta ),
			easing:maze.move.voc.easing,
			complete: complete
		});
	});


	/*
		margin-top the first paragraph
		@param el	- the div.term HTML object, given as JQuery object or just as string selector
	*/
	maze.move.voc.show =  maze.move.factory(function(el, next, complete ){
		maze.log("[maze.move.voc.show]", el);
		if( el.hasClass("force-open") ){
			maze.move.voc.open( el,{
				callback:complete
			});
			return;
		}
		if (el.hasClass("preview")){
			complete();
			return;
		}

		var paragraphs = el.find(".paragraphs"),
				ellipsis = el.find(".ellipsis"),
				height = Math.min( paragraphs.outerHeight(), maze.move.voc.preview_height );

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


	maze.move.voc.hide = maze.move.factory(function(el, next, complete ){
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
					});
					maze.move.ellipsis.hide( ellipsis );
					complete();
				}
			});

		//
	});


	maze.move.voc.swipeout = maze.move.factory(function(el, next, complete ){
		var h = el.outerHeight();

		if (!el.length)
			setTimeout(complete, next.delay || 0);

		else if (el.hasClass('preview'))
			maze.move.voc.hide(
				el,
				{
					callback: maze.move.voc.swipeout,
					args:[
						el,
						{
							callback: complete
						}
					]
				}
			);

		else
			el.stop()
				.addClass('swipedout')
				.delay(next.delay ? next.delay : 0)
				.animate({opacity: 0}, {easing: maze.move.voc.easing, duration: 450})
				.animate({'margin-top': -h}, {
					easing: maze.move.voc.easing,
					duration: 350,
					complete: complete
				});
	});

	maze.move.voc.swipein = maze.move.factory(function(term, next, complete ){
		var w = term.outerWidth(),
			h = term.outerHeight();
		term.css({
			opacity:0,
			display:'block',
			'margin-top': -h
		}).removeClass("swipedout");

		if( term.hasClass('match') ){
			term.find(".paragraphs").hide();
		}

		term.stop().delay( next.delay?next.delay:0 )
			.animate({'margin-top':0},{
				easing:maze.move.voc.easing,
				duration:350
			})
			.animate({'opacity':1},{
				easing:maze.move.voc.easing,
				duration:250,
				complete: function(){
					if( term.hasClass('match') ){
						term.find(".paragraphs").slideDown({
							easing:maze.move.voc.easing,
							duration:450,
							complete:complete
						});
					} else {
						complete();
					}
				}
			});
	});

	maze.move.voc.toggle_open = maze.move.factory(function(el, next, complete ){
		el.hasClass('opened-collapsed')? maze.move.voc.open( el, { callback:maze.move.voc.scrollto, args:[ el, { callback:complete } ] } ):maze.move.voc.close( el, { callback:complete });
	});
	/*
		Open with slidedown.
	*/
	maze.move.voc.open =  maze.move.factory(function(el, next, complete ){
		el.removeClass("opened-collapsed")
		if( el.hasClass("opened") && next.callback ){
			complete();
			return;
		}


		var paragraphs = el.find(".paragraphs"),
			ellipsis = el.find(".ellipsis");

		if (!el.hasClass('preview')){
			var height = paragraphs[0].scrollHeight;

			el.addClass('opened');
			maze.move.ellipsis.hide( ellipsis );
			paragraphs.slideDown({
					easing:maze.move.text.easing,
					duration:maze.move.text.duration(height),
					queue:false,
					complete:complete
			});
			return;
		}

		var height = paragraphs.outerHeight();


		paragraphs.stop().animate(
			{
				height:paragraphs[0].scrollHeight
			},
			{
				easing:maze.move.voc.easing,
				duration:maze.move.voc.duration(height),
				complete:function(){
					el.addClass("opened");
					paragraphs.css('height','');
					maze.move.ellipsis.hide( ellipsis );
					complete();
				}
			}
		);
	});

	/*
		Close a term
	*/
	maze.move.voc.close =  maze.move.factory(function(el, next, complete ){
		el.removeClass("preview");
		var paragraphs = el.find(".paragraphs"),
			height = paragraphs.outerHeight();

		paragraphs.stop().slideUp({
			easing:maze.move.voc.easing,
			duration:maze.move.voc.duration(height),
			complete:function(){
				el.removeClass("opened preview");
				el.addClass("opened-collapsed");
				complete();
			}
		});
	});

	maze.move.voc.close_and_hide =  maze.move.factory(function(el, next, complete ){

		var paragraphs = el.find(".paragraphs"),
				height = paragraphs.outerHeight();


		paragraphs.stop().slideUp({
			easing:maze.move.voc.easing,
			duration:maze.move.voc.duration(height),
			complete:function(){
				el.removeClass("opened preview");
				complete();
			}
		});


	});

	/*

		SEARCH
		------

		and other collapsible stuffa
	*/

	maze.move.voc.toggle_collapsed = maze.move.factory(function(el, next, complete ){
		el.hasClass('collapsed')? maze.move.voc.show_collapsed( el, { callback:maze.move.voc.scrollto, args:[ el, { callback:complete } ] } ):maze.move.voc.hide_collapsed( el, { callback:complete });
	});

	maze.move.voc.toggle_static_match = maze.move.factory(function(el, next, complete ){
		el.hasClass('collapsed')? maze.move.voc.show_match( el, { callback:maze.move.voc.scrollto, args:[ el, { callback:complete } ] } ):maze.move.voc.scrollto( el, { callback:maze.move.voc.hide_match, args:[ el, {callback:complete}] });
	});

	maze.move.voc.show_collapsed =  maze.move.factory(function(el, next, complete ){

		var paragraphs =  el.find(".paragraphs").first(),
			ellipsis = el.find(".ellipsis"),
			height = paragraphs.outerHeight();


		paragraphs.slideDown({
			easing:maze.move.voc.easing,
			duration:maze.move.voc.duration( height ),
			complete:function(){
				el.removeClass("collapsed");
				maze.move.ellipsis.show( ellipsis, {
					callback:complete
				});
			}
		});

	});


	maze.move.voc.hide_collapsed = maze.move.factory(function(el, next, complete ){

		var paragraphs =  el.find(".paragraphs").first(),
			ellipsis = el.find(".ellipsis"),
			height = paragraphs.outerHeight();

		maze.move.ellipsis.hide( ellipsis );
		paragraphs.slideUp({
			duration: maze.move.voc.duration( height ),
			easing: maze.move.voc.easing,
			complete:function(){
				el.addClass("collapsed");
				complete();
			}
		});



	});

	maze.move.voc.set_leader = maze.move.factory(function(scene, next, complete ){

		maze.trigger( maze.events.story.lock );
		maze.move.fadeout( maze.vars.static_chapter );
		maze.move.fadeout( maze.vars.static_subheading );
		maze.move.fadeout( maze.controllers.scroll.boxes.text,{
			callback:maze.move.columns.empty,
			args:[ maze.controllers.scroll.boxes.doc,{
				callback:maze.move.voc.enter,
				args:[ scene.item,{
					callback:maze.move.columns.adjust,
					args:[ scene,{
						callback:function(){
							maze.trigger(  maze.events.story.push, scene );
						}
					}]
				}]
			}]

		});

	});

})( jQuery, window);
