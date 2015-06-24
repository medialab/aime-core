( function( $, w, undefined ){
	'use strict';
	var maze = w.maze || {};
	maze.move = { text:{}, voc:{}, doc:{}, comm:{} };
	maze.move.preview_height = 180;


	/*


		The animation factory
		=====================

		Just declare animation function with his own callback and a single JQUERY object (or its css selector given as string )
		Animations work with transit.js library http://ricostacruz.com/jquery.transit/


		e.g animation function code:

		maze.move.voc.swipeout = maze.move.factory(function(el, options, complete ){
			var w = el.outerWidth(), h = el.outerHeight();

			// your animation with transit.js  here,
			// just remember filling the 'complete' param of transit transition() funciton

			el
				.css({position:'relative'})
				.transition({'left':w,easing:'easeInOutQuint'})
				.transition({'margin-top': -h, easing:'easeInOutQuint', complete: complete})
		});

		usage sample:

		> maze.move.voc.swipeout("#vocab-27", { callback:function(){alert('vocabulary el swiped out')} })

	*/
	maze.move.factory = function(fn) {
		return function(el, next) {
			if (typeof el === 'string' )
				el = $(el);

			fn.call(this, el, next || {}, function() {
				if (next && typeof next.callback === 'function')
					next.callback.apply(this, next.args || {});
			});
		}
	};

	/*


		Basic shared movement
		=====================

	*/
	maze.move.duration = 100;
	maze.move.calculate_duration = function( distance ){
			return Math.min( 750, Math.max( 350, distance / 0.6))
	};
	maze.move.easing = "easeInOutQuad";

	/*


		Column transitions
		------------------

	*/
	maze.move.columns = {};
	maze.move.columns.adjust = maze.move.factory(function( scene, next, complete ){


		maze.trigger( maze.events.story.columnify, scene );
		// timer for css transition + some time

		clearTimeout( maze.move.columns.timer_adjust );
		if( maze.story.is_columnable( scene ) ){
			maze.move.columns.timer_adjust = setTimeout( function(){
				try{ next.callback.apply(this, next.args ) }catch(e){ maze.move.shared.complete(e); }
			}, 550);
		} else{
			try{ next.callback.apply(this, next.args ) }catch(e){ maze.move.shared.complete(e); }
		}

	});

	maze.move.columns.empty = maze.move.factory(function( column, next, complete ){

		//maze.engine.elements.vocabulary.status = maze.ENGINE_ELEMENT_STATUS_STARTUP;


		column.stop().animate({opacity:0},{easing:maze.move.easing, duration:maze.move.duration, complete:function(){
			column.empty();
			column.css({'opacity':1});
			try{ next.callback.apply(this, next.args ) }catch(e){ maze.move.shared.complete(e); }
		}});



	});


	maze.move.fadeout = maze.move.factory(function( el, next, complete ){
		el.stop().animate({opacity:0},{easing:maze.move.easing, duration:250,complete:complete,queue:false});
	});
	maze.move.fadein = maze.move.factory(function( el, next, complete ){
		el.stop().animate({opacity:1},{easing:maze.move.easing, duration:250,complete:complete,queue:false});
	});


	maze.move.ellipsis = {};
	maze.move.ellipsis.show = maze.move.factory(function(ellipsis, next, complete ){
		return;
		ellipsis.show({
			easing:maze.move.easing,
			duration:maze.move.duration,
			complete:complete,
			queue:false
		});
	});
	maze.move.ellipsis.hide = maze.move.factory(function(ellipsis, next, complete ){
		return;
		ellipsis.hide({
			easing:maze.move.easing,
			duration:maze.move.duration,
			complete:complete,
			queue:false
		});
	});


	/*

		Scrollto
		---

		todo: documentation
	*/
	maze.move.scrollto = maze.move.factory(function(el, options, complete ){
		var box = el.closest(".wrapper"),
        options = options || {},
        offset = options.offset || 0,
        target = options.target || false,
        scrolltop = box.scrollTop(),
        to_scrolltop = scrolltop + el.position().top,
        delta;

    if(offset)
      to_scrolltop += offset;

    if(target) // a jquery object!!!
      to_scrolltop += target.position().top;
		// maze.log( '\n\n\n\n', '>>> maze.move.scrollto', to_scrolltop );
    delta = Math.abs( scrolltop - to_scrolltop );

		box.stop().animate(
			{
				scrollTop: to_scrolltop
			},
			{
				duration: maze.move.calculate_duration( delta ),
				easing: maze.move.easing,
				complete: complete
			}
		);
	});


	/*

		Open / Close
		---

	*/
	maze.move.toggle_open = maze.move.factory(function(el, options, complete ){
		if( el.hasClass('opened-collapsed') || options.force )
			maze.move.open( el, {
				callback:maze.move.scrollto,
				args:[ el, {
					callback:complete
				}]
			})
		else
			maze.move.close( el, {
				callback:complete
			});
	});


	maze.move.open =  maze.move.factory(function(el, next, complete ){
    el.removeClass("opened-collapsed");
		if(el.hasClass("opened")){
      maze.log('>>>  maze.move.open: already opened');
			complete();
			return;
		}

		var paragraphs = el.find(".paragraphs"),
			ellipsis = el.find(".ellipsis"),
      actions = paragraphs.find(".actions"),
      height = paragraphs[0].scrollHeight;

    if(actions.length)
      height += actions[0].scrollHeight;

		if (!el.hasClass('preview')){
      maze.log('>>>  maze.move.open: wide opening height=', height);

			el.addClass('opened');
			maze.move.ellipsis.hide( ellipsis );
			paragraphs.slideDown({
					easing: maze.move.easing,
					duration: maze.move.calculate_duration(height),
					queue: false,
					complete: complete
			});
		} else {
			maze.log('>>>  maze.move.open: from .preview, adjusting height=', height);

      paragraphs.stop().animate({height: height}, {
					easing: maze.move.easing,
					duration:maze.move.calculate_duration(height),
					complete:function(){
						el.addClass("opened");
            paragraphs.css(
              'height', ''
            )
						maze.move.ellipsis.hide( ellipsis );
						complete();
					}
			});
		}
	});


	maze.move.close =  maze.move.factory(function(el, next, complete ){
		el.removeClass("preview");
		var paragraphs = el.find(".paragraphs"),
			height = paragraphs.outerHeight();
    maze.log('>>>  maze.move.close: from height=', height);
		paragraphs.stop().slideUp({
			easing:maze.move.easing,
			duration:maze.move.calculate_duration(height),
			complete:function(){
				el.removeClass("opened preview");
				el.addClass("opened-collapsed");
				complete();
			}
		});
	});

	maze.move.close_and_hide =  maze.move.factory(function(el, next, complete ){
		var paragraphs = el.find(".paragraphs"),
				height = paragraphs.outerHeight();
		paragraphs.stop()
      .delay(next.delay || 0)
      .slideUp({
  			easing:maze.move.easing,
  			duration:maze.move.calculate_duration( height ),
  			complete:function(){
  				el.removeClass("opened preview");
  				complete();
  			}
		  });

	});

	maze.move.toggle_preview = maze.move.factory(function(el, next, complete ){
		if( el.attr('data-status') == 'force-open' )
      maze.move.toggle_open( el, {
      	callback:complete,
      	force:true
      });
    else if( el.hasClass('preview') )
			maze.move.hide( el, {
				callback:complete
			})
		else
			maze.move.show( el, {
				callback: maze.move.scrollto,
				args:[ el, {
					callback: complete
				}]
			});
	});

	/*
		margin-top the first paragraph
		@param el	- the div.el HTML object, given as JQuery object or just as string selector
	*/
	maze.move.show =  maze.move.factory(function(el, next, complete ){
		maze.log(" >>> maze.move.show ", el );

		if( el.attr('data-status') == "force-open" ){
			maze.move.open( el,{
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
				height = Math.min( paragraphs.outerHeight(), maze.move.preview_height );

		el.addClass("preview");

		paragraphs
			.css({
				height: height
			})
			.slideDown({
				easing:maze.move.easing,
				duration:maze.move.calculate_duration(height),
				queue:false,
				complete:complete
			});

		maze.move.ellipsis.show( ellipsis );
	});


	maze.move.hide = maze.move.factory(function(el, next, complete ){
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
				easing:maze.move.easing,
				duration:maze.move.calculate_duration(height),
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


	/*

		Open / Close items having .match class
		---

	*/
	maze.move.toggle_collapsed = maze.move.factory(function(el, next, complete ){
		if( el.hasClass('collapsed') )
			maze.move.show_collapsed(el, {
				callback: maze.move.scrollto,
				args:[ el, {
					callback:complete
				}]
			})
		else
			maze.move.hide_collapsed(el, {
				callback:complete
			});
	});

	maze.move.show_collapsed =  maze.move.factory(function(el, next, complete ){
		var paragraphs =  el.find(".paragraphs").first(),
				height = paragraphs.outerHeight();

		paragraphs.slideDown({
			easing:maze.move.easing,
			duration:maze.move.calculate_duration( height ),
			complete:function(){
				el.removeClass("collapsed");
				complete();
			}
		});
	});


	maze.move.hide_collapsed = maze.move.factory(function(el, next, complete ){
		var paragraphs =  el.find(".paragraphs").first(),
			height = paragraphs.outerHeight();

		paragraphs.slideUp({
			duration: maze.move.calculate_duration( height ),
			easing: maze.move.easing,
			complete:function(){
				el.addClass("collapsed");
				complete();
			}
		});
	});



	/*

		Swipein / Swipeout
		---

	*/
	maze.move.swipeout = maze.move.factory(function(el, next, complete ){
		var h = el.outerHeight();

		if (!el.length)
			setTimeout(complete, next.delay || 0);

		else if (el.hasClass('preview'))
			maze.move.hide( el, {
				callback: maze.move.swipeout,
				args:[ el,{
					callback: complete
				}]
			});

		else
			el.stop()
				.addClass('swipedout')
				.delay(next.delay ? next.delay : 0)
				.animate({opacity: 0}, {
					easing: maze.move.voc.easing,
					duration: 350
				})
				.animate({'margin-top': -h}, {
					easing: maze.move.easing,
					duration: 350,
					complete: complete
				});
	});

	maze.move.swipein = maze.move.factory(function(el, options, complete ){
		var w = el.outerWidth(),
			h = el.outerHeight();
		el.css({
			opacity:0,
			display:'block',
			'margin-top': -h
		}).removeClass("swipedout");

		if( el.hasClass('match') ){
			el.find(".paragraphs").hide();
		}

		el.stop().delay( options.delay?options.delay:0 )
			.animate({'margin-top':0},{
				easing:maze.move.easing,
				duration:350
			})
			.animate({'opacity':1},{
				easing:maze.move.easing,
				duration:250,
				complete: function(){
					if( el.hasClass('match') ){
						el.find(".paragraphs").slideDown({
							easing:maze.move.easing,
							duration:450,
							complete:complete
						});
					} else {
						complete();
					}
				}
			});
	});

	maze.move.unmatch =  maze.move.factory(function(el, options, complete ){
		var box = el.closest('.box');
				box.unhighlight({ element: 'span', className: 'highlight' });
        box.find(".match").removeClass("match");
    complete();
	});

	maze.move.inject = maze.move.factory(function(el, options, complete ){

		el.find("[data-src]").each( function( i, e ){
    	var media = $(e),
    			width = +media.attr('data-width'),
    			height = +media.attr('data-height'),
    			available_width,
    			ratio;

    	if( width > 0 ){
    		available_width = media.parent().width();
    		ratio = available_width / width;
    		media.css({
    			width: width*ratio,
    			height: height*ratio
    		});

    	}

      media.attr('src',media.attr('data-src'));
    });

    el.find("[data-pdf]").each( function( i, e ){
    	var media = $(e);
      media.pidif({
        url: media.attr('data-pdf')
      });
    });

    el.find("[data-video]").each( function( i, e ){
    	var media = $(e);
    	media.empty().html('<div>' + media.attr('data-video') + '</div>')
    });

		el.find("[data-html]").each( function( i, e ){
	      var media = $(e);
	      media.empty().html('<div>' + media.attr('data-html') + '</div>');
	  });


    complete();
  });

  maze.move.inject_preview = maze.move.factory(function(el, options, complete ){

		el.find("[data-src]").each( function( i, e ){
    	var media = $(e),
    			width = +media.attr('data-width'),
    			height = +media.attr('data-height'),
    			available_width,
    			ratio;

    	if( width > 0 ){
    		available_width = media.parent().width();
    		ratio = available_width / width;
    		if( ratio != 0 )
	    		media.css({
	    			width: width*ratio,
	    			height: height*ratio
	    		});

    	}

      media.attr('src',media.attr('data-src'));
    });


    complete();
  });
})( jQuery, window);
