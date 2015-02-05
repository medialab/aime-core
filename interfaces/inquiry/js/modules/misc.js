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
    var header = $('#header');

    this.triggers.events.toggle = function( controller ){
      var toggle_menu = $('.toggle_menu p');

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

    header.on('click', '.toggle_menu', this.triggers.events.toggle );
    
    // activate logout
    header.on('click', '.signout', function(e) {
      e.preventDefault();
      maze.domino.controller.request('logout');

    });

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
  }
})();
