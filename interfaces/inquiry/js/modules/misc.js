;(function(undefined) {
  'use strict'

  mlab.pkg('maze.domino.modules');



  /*
    More button
    ---

    This open/close the header bar
  */
  maze.domino.modules.More = function() {
    domino.module.call(this);

    var _self = this;

    this.triggers.events.toggle = function( controller ){
      var header = $('#header'),
          toggle_menu = $('.toggle_menu p');

      if ( header.attr('meta-status') == 'closed' ) {
        header.css({ top: 0});
        header.attr('meta-status', 'opened');
        toggle_menu.text('less');
      } else {
        header.css({ top: -200});
        header.attr('meta-status', 'closed');
        toggle_menu.text('more');
      }

    }

    maze.on('click', '.toggle_menu', this.triggers.events.toggle );

  };



  /*
    Rangy library wrapper
    ---

    Handle text selection and dispatch maze.domino events
  */
  maze.domino.modules.Poppy = function() {
    domino.module.call(this);

    var _self = this;

    this.triggers.events.text_select = function( controller ){

    }

    this.triggers.events.text_selected = function( controller ){

    }
  };

  maze.domino.modules.Resizor = function() {
    domino.module.call(this);
    var _self = this;

    $(window).resize(function(){
      _self.dispatchEvent('resize');
    });

    this.triggers.events.resize = function(){
      maze.vars.column_height = $(window).height() - 135;
      clearTimeout( maze.timers.resizor_resize );
      maze.timers.resizor_resize = setTimeout( function(){
        _self.dispatchEvent('resized');
      }, 250 );
    }

  };



  /*

      Sticky handlers
      ---

      For all the columns

  */
  maze.domino.modules.StickyText = function() {
    domino.module.call(this);

    var _self = this;

    // this.chapter = $("#static-text .chapter");
    // this.chapter_title = $("#static-chapter-title");
    // this.chapter_number = $("#static-chapter-number");
    // this.chapter_shadow = $("#static-text .chapter-shadow");

    // this.subheading = $("#static-subheading");
    // this.subheading_title = $("#static-subheading-title");
    // this.subheading_shadow = $("#static-subheading .subtitle-shadow");




   
    // // publicly available (we don't want to have events for them)
    // maze.sticky = maze.stocky || {};

    // this.chapter_cache = {
    //   offset:-100000,
    //   shadow:false
    // }

    // /*

    //   Text sticky text
    //   ---

    // */
    // this.triggers.events.sticky_chapter_update = function( controller, e ){

    //   _self.chapter_title.html( e.data.title );
    //   _self.chapter_number.html( e.data.number );
    //   _self.chapter.attr('data-id',e.data.id);
    //   //_self.chapter.attr('class', e.data.classes ).attr('data-id', e.data.id).css({top:0});


    // }

    // this.triggers.events.sticky_chapter_adjust = function( controller, e ){
    //   if( typeof e.data.offset != "undefined" && e.data.offset != _self.chapter_cache.offset ){
    //     _self.chapter_cache.offfset = e.data.offset;
    //     _self.chapter.css({
    //       top:e.data.offset
    //     });
    //   }

    //   if( typeof e.data.shadow != "undefined" && e.data.shadow==0 != _self.chapter_cache.shadow ){
    //     _self.chapter_cache.shadow = e.data.shadow==0;
    //     _self.chapter_shadow.css({
    //       opacity:e.data.shadow==0?0:1
    //     });
    //   }
    // }

    // this.triggers.events.sticky_subheading_update = function( controller, e ){
    //   //maze.log('sticky_subheading_update', e.data)
    //   _self.subheading_title.html( e.data.title );
    //   _self.subheading.attr('class', e.data.classes ).attr('data-id',e.data.id);
    //   //_self.subheading.attr('class', e.data.classes ).attr('data-id', e.data.id).css({top:0});

    //   //_self.log('sticky_subheading_change changed!!!!!', e.data );
    // }

    // this.triggers.events.sticky_subheading_adjust = function( controller, e ){
    //   //maze.log('sticky_subheading_adjust', e.data)
    //   if( typeof e.data.offset != "undefined")
    //     _self.subheading.css({
    //       top:e.data.offset
    //     });

    //   if( typeof e.data.shadow_offset != "undefined")
    //     _self.subheading_shadow.css({
    //       bottom:e.data.shadow_offset
    //     });

    // }

    

    
  }
})();
