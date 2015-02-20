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

    var _self  = this,
        header = $('#header');

    this.triggers.events.session__initialized = function(controller) {
      $('#header').replaceWith(maze.engine.template.header({
        settings: maze.settings,
        user: controller.get('user')
      }));
      header = $('#header');

      header.on('click', '.toggle_menu', function(e) {
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
      });
    
      // activate logout
      header.on('click', '.signout', function(e) {
        e.preventDefault();
        maze.domino.controller.request('logout');

      });

      header.on('click', '.langBloc', function(e) {
        var lang = $(this).attr('data-lang');
        _self.dispatchEvent('lang_change', {lang:lang});
      });

      // and, last but not least, the tweeetters
      // ask for status
      $.getJSON('http://aime.medialab.sciences-po.fr/tweets-aime.json', function(res) {
        $("#twitter-box .tweets").append(res.splice(0,5).map(function(d) {
          return maze.engine.template.tweet({tweet: d});
        }))
        header.addClass('ready')
      });
      _self.log('More', '@session__initialized');
    }
      

    /*
      Reload user profile on opdate
    */
    this.triggers.events.user__updated = function(controller) {
      var user = controller.get('user');
      header.find('.username').text(user.name || user.surname)
    }

    
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
