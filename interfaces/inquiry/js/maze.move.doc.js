( function( $, w, undefined ){ var maze = w.maze || {}; maze.move = maze.move || {};
	'use strict';

	maze.move.doc = {
		duration:function( distance ){
			return Math.min( 750, Math.max( 350, distance / 0.6))
		},
		easing:"easeInOutQuad",
		preview_height:180
	};

	maze.move.doc.scrollto = maze.move.factory(function(el, next, complete ){

		var scrolltop = maze.columns.doc.scrollTop() + el.position().top ,
			delta = Math.abs( maze.columns.doc.scrollTop() - scrolltop );

		maze.columns.doc.stop().animate({scrollTop: scrolltop},{
			duration:maze.move.doc.duration( delta ),
			easing:maze.move.doc.easing,
			complete: complete
		});
	});

	maze.move.doc.toggle_preview = maze.move.factory(function(el, next, complete ){
		el.hasClass('preview')?
			maze.move.doc.hide( el, {
				callback:complete
			}):
			maze.move.doc.show( el, {
                callback:maze.move.doc.scrollto,
                args:[ el, {
                    callback:maze.move.doc.inject,
                    args:[ el,{
                        callback:complete
                    }]
                }]
            });
	});

	maze.move.doc.inject = maze.move.factory(function(el, next, complete ){
        el.find("[data-src]").each( function( i, e ){
            var media = $(e);
            media.attr('src',media.attr('data-src'));
        });
    });

	maze.move.doc.show =  maze.move.factory(function(el, next, complete ){ maze.log("[maze.move.doc.show]", el);
		if( el.hasClass("preview") && next.callback ){
			complete();
			return
		}

		var paragraphs = el.find(".paragraphs"),
				ellipsis = el.find(".ellipsis"),
				height = Math.min( paragraphs.outerHeight(), maze.move.doc.preview_height );

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



	maze.move.doc.hide = maze.move.factory(function(el, next, complete ){
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
					el.find("[data-src]").each( function(){
              			$(this).attr('src','');
          			});
					maze.move.ellipsis.hide( ellipsis );
					complete();
				}
			});
	});




	maze.move.doc.swipeout = maze.move.factory(function(el, next, complete ){
		var w = el.outerWidth(), h = el.outerHeight();
		if( el.hasClass('preview') ){
			maze.move.doc.hide( el, {callback:maze.move.doc.swipeout, args:[ el, {callback:complete} ]});
			return
		}

		el.stop()
			.addClass("swipedout")
			.delay( next.delay?next.delay:0 )
			.animate({'opacity':0},{easing:maze.move.doc.easing,duration:450 })
			.animate({'margin-top':-h},{easing:maze.move.doc.easing,duration:350 , complete: complete});
	});

	maze.move.doc.swipein = maze.move.factory(function(el, next, complete ){
		var w = el.outerWidth(), h = el.outerHeight();
		el.css({opacity:0,'margin-top': -h}).removeClass("swipedout");

		var realComplete = complete;

		var doc_in_scene = maze.story.scene.doc;
		if( doc_in_scene ){
			// intercept and force opening...
			realComplete = function() {
				maze.move.doc.open( el, { callback:complete })
			};
		}

		el.stop().delay( next.delay?next.delay:0 )
			.animate({'margin-top':0},{easing:maze.move.doc.easing,duration:450 })
			.animate({'opacity':1},{easing:maze.move.doc.easing,duration:350 , complete: realComplete});
	});


		/*
		Open with slidedown.
	*/
	maze.move.doc.open =  maze.move.factory(function(el, next, complete ){

		if( el.hasClass("opened") && next.callback ){
			complete();
			return;
		}


		var paragraphs = el.find(".paragraphs"),
			ellipsis = el.find(".ellipsis");

		if (!el.hasClass('preview')){
			var height = paragraphs[0].scrollHeight;

			el.addClass('opened');
			paragraphs.slideDown({
					easing:maze.move.text.easing,
					duration:maze.move.text.duration(height),
					queue:false,
					complete:function(){
						el.find("[data-src]").each( function( i, e ){
                var media = $(e);
                media.attr('src',media.attr('data-src'));
            });
            el.find("[data-pdf]").each( function( i, e ){
                var media = $(e);
                media.pidif({
                	url:media.attr('data-pdf')
                });
            });
						el.find("[data-html]").each( function( i, e ){
                var media = $(e);
                media.empty().html('<div>' + media.attr('data-html') + '</div>');
            });
						complete();
					}
			});

			maze.move.ellipsis.hide( ellipsis );
			return
		}

		var height = paragraphs.outerHeight();


		paragraphs.stop().animate({height:paragraphs[0].scrollHeight},{
			easing:maze.move.voc.easing,
			duration:maze.move.voc.duration(height),
			complete:function(){
				el.addClass("opened");
				paragraphs.css('height','');
				maze.move.ellipsis.hide( ellipsis,{
					callback: function(){
						complete();
					}
				});
			}
		});


	});




})( jQuery, window);
