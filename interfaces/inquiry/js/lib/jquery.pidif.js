/*!
 * jQuery PDF Lite viewer plugin
 *
 *
 *
 */

//
//
//
// usage scenario with handlebars template: 
// <div class="pdf-wrapper">
//       <canvas/>
//       <div class="fullscreen button"><i class="icon-fullscreen"></i> click to read</div>
//       <div class="page-wrapper">
//         <div class="page">
//           <input type="text" name="pdf-page"/>
//           <div class="of">of</div>
//           <div class="num-pages"></div>
//           <div class="pdf-arrow left button previous"><i class="fa fa-angle-left"></i></div>
//           <div class="pdf-arrow right button next"><i class="fa fa-angle-right"></i></div>
//         </div>
//       </div>
//   </div>
//
//
(function ( $, PDFJS, undefined ) {

    $.fn.pidif = function( options ) {
      var BOTH_DIMENSIONS = 'BOTH_DIMENSIONS',
          WIDTH = 'WIDTH',
          HEIGHT = 'HEIGHT';

      Handlebars.registerHelper("foreach",function(arr,options) {
        if(options.inverse && !arr.length)
        return options.inverse(this);

        return arr.map(function(item,index) {
          item.$index = index;
          item.$width = 100/arr.length;
          item.$left = index * item.$width;
          item.$first = index === 0;
          item.$last  = index === arr.length-1;
          return options.fn(item);
        }).join('');
      });
      Handlebars.registerHelper('multiply', function(value, multiplier) {
        return value * multiplier;
      });

      var _self = this,
          settings = $.extend({
            url:'/local/pdf',
            padding: 20,
            height: 300,
            verbose: true,
            template: Handlebars.template.pdf, // COMPILED Handlebar template for the viewer
          }, options),
          listeners = {},
          view = {
            pdf: null, // the pdfdoc item
            pages:{},// a dict of PDFpage, indexed by their page number
            wrapper:[], // JqueryObject
            slides:[],// will contain some page information as objects
            current_page:1, // current page number
            num_pages:0, // number of pages to be displayed
            fit:1.0, // fittest scale value
            scale:1.0 // desired scale value
          };


      var log = function(){
        if( settings.verbose ){
          settings.logging_index = settings.logging_index || 0;
          settings.logging_index++;
          var args = ['#', settings.logging_index, '- PIDIF:' ].concat( Array.prototype.slice.call(arguments) );
          console.log.apply(console, args );
        }
      };

      var factory = function(fn){
        return function( args, options) {
          fn.call(this, args, options, function() {
            if (options && typeof options.complete === 'function')
              options.complete.apply(this, options.args );
          });
        };
      };

      var moveto = function( page_number ){
        page_number = page_number < 1?1: page_number > view.num_pages? view.num_pages: page_number
        view.current_page = page_number;
        _self.find(".page input").val( page_number );

        if( page_number == 1)
            maze.move.fadeout( _self.find(".left") );
          else
            maze.move.fadein( _self.find(".left") );

          if( page_number ==  view.num_pages )
            maze.move.fadeout( _self.find(".right") );
          else
            maze.move.fadein( _self.find(".right") );

          view.wrapper.animate({ left: ( -(page_number-1) * 100) + '%'},{
            easing:maze.move.easing,
            duration:550,
            queue:false,
            complete:function(){
              var canvas = get_canvas( page_number );

              cascade = {};
              if( page_number + 1 < view.num_pages + 1 )
                cascade = {
                  complete:load,
                  args:[{
                    page_number:page_number + 1,
                    canvas:get_canvas( page_number + 1 )
                  }]
                };

              load({
                page_number:page_number,
                canvas: canvas
              }, cascade );

            }
          });
      };

      var render = factory( function( args, options, complete ){
        var viewport = args.page.getViewport( view.fit ),
            context = args.canvas[0].getContext('2d');

        args.canvas[0].height = viewport.height;
        args.canvas[0].width = viewport.width;

        args.page.render({
            canvasContext: context,
            viewport: viewport,
            complete: complete
        });
        args.canvas.parent().attr("data-status", 'rendered');
        log( "render..." );
      });

      var load = factory( function( args, options, complete ){
        if( typeof view.pages[ args.page_number ] != "undefined"){
          log( "load: page", args.page_number, 'already loaded, skipping' );
          complete();
          return;
        }
        log( "load: get page", args.page_number );

        view.pdf.getPage( args.page_number ).then(function( page ){
          log( "load: get page", args.page_number, " success" );
          view.pages[ args.page_number ] = page;
          args.canvas.parent().attr("data-status", 'load');

          if( view.fit == 0 )
            adjust( page, BOTH_DIMENSIONS );

          render({
            page: page,
            canvas: args.canvas
          },{
            complete: complete
          });

        }, maze.error );

      });

      /*
        @param
        @param
      */
      var adjust = function( page, contraints ){
        var viewport = page.getViewport( 1.0 ), // load real dimension, viewport at scale 1.0
            wrapper_width = _self.width() - settings.padding*2,
            wrapper_height = _self.height() - settings.padding*2;

        if( contraints == BOTH_DIMENSIONS )
          view.fit = Math.min( wrapper_width / viewport.width, wrapper_height/viewport.height ); // reset scale vale as default, 'fit' scale
        else if( contraints == WIDTH )
          view.fit = Math.min( wrapper_width / viewport.width );
        else if( contraints == HEIGHT )
          view.fit = Math.min( rapper_height/viewport.height  );

        $(window).trigger('pdfResized',{
          height: viewport.height,
          width: viewport.height,
          ratio: view.fit
        });
      };

      var fit = function( contraints ){
        var dist = Math.max( view.current_page, view.num_pages - view.current_page ),
            current_page =
            candidates = [],
            cascade = {},
            node = {};

        for( var i = 1; i < dist; i++ ){
          if( typeof view.pages[ view.current_page + i] != "undefined" )
            candidates.push( view.current_page + i );

          if( typeof view.pages[ view.current_page - i] != "undefined" )
             candidates.push( view.current_page - i );
        }

        console.log( "adjusting pages ", candidates);

        for( var j in candidates ){
          var canvas = get_canvas( candidates[j] );
          node = $.extend({}, cascade );
          cascade = {
            complete: render,
            args:[{
              page:view.pages[ candidates[j] ],
              canvas:canvas }, node ]
          };
        }

        adjust( view.pages[ view.current_page ], contraints );
        render({
          page:view.pages[ view.current_page ],
          canvas:get_canvas( view.current_page  )
        }, cascade );


      }

      var get_canvas = function( page_number ){
        return _self.find("[data-page="+ (page_number - 1 ) + "] canvas");
      }

      listeners.previous = function( event ){
        moveto( view.current_page - 1 );
      }

      listeners.next = function( event ){
        moveto( view.current_page + 1 );
      }



      listeners.fullscreen = function( event ){
        var wrapper = document.getElementById( _self.attr('id') ),
            el = document.documentElement,
            rfs = el.requestFullScreen || el.webkitRequestFullScreen || el.mozRequestFullScreen;
        if( wrapper.requestFullscreen ) {
          wrapper.requestFullscreen();
        } else if (wrapper.mozRequestFullScreen) {
          wrapper.mozRequestFullScreen();
        } else if (wrapper.webkitRequestFullScreen) {
          wrapper.webkitRequestFullScreen();
        }
      };

      /*
        Initialize
      */
      PDFJS.disableWorker = true;
      PDFJS.getDocument( settings.url ).then( function(pdf){
        log( "getDocument:", settings.url );
        view.pdf = pdf;
        view.num_pages = pdf.numPages;

        for( var i = 0; i < view.num_pages; i++ )
          view.slides.push({p:i});

        _self.empty().append(settings.template({
          slides:view.slides
        }));

        view.wrapper = _self.find(".slides-wrapper");
        _self.find('.page .num-pages').text( view.num_pages );
        moveto(1);

        _self.on("click", '.fullscreen',  listeners.fullscreen );
        _self.on("click", '.previous',  listeners.previous );
        _self.on("click", '.next',  listeners.next );
        _self.on("click", '.adjust-width', function(event){fit(WIDTH)});
        _self.on("click", '.adjust-height', function(event){fit(BOTH_DIMENSIONS)});

        $(window).trigger('pdfLoaded', {
          target: _self 
        });

      });
    };
}( jQuery, PDFJS ));
