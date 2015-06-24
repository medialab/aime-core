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
        header = $('#header'),
        twitterbox = $("#twitter-box .tweets"),
        tweet_h = 170, // tweet container height
        tweets = [],
        tweet_index = 0;


    var prev_tweet = function() {
      tweet_index--;
      tweet_index = Math.max(0,tweet_index);
      slide_tweet()
    };

    var next_tweet = function() {
      tweet_index++;
      tweet_index = Math.min(tweets.length-1, tweet_index);
      slide_tweet()
    };

    var slide_tweet = function() {
      if(tweet_index > 0 && tweet_index < tweets.length-1)
        $("#twitter-box .up").fadeIn()
      $("#twitter-box .down").fadeIn()
      if(tweet_index == 0)
        $("#twitter-box .up").fadeOut()
      if(tweet_index == tweets.length-1)
        $("#twitter-box .down").fadeOut()
      twitterbox.css('margin-top', -tweet_h * tweet_index);
    }

    this.triggers.events.session__initialized = function(controller) {
      $('#header').replaceWith(maze.engine.template.header({
        settings: maze.settings,
        user: controller.get('user'),
        lang: maze.i18n.lang
      }));
      $("#wrapper").fadeIn();
      $("#loader").fadeOut();

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

      twitterbox = $("#twitter-box .tweets");
      // and, last but not least, the tweeetters
      // ask for status
      $.getJSON('http://aime.medialab.sciences-po.fr/tweets-aime.json', function(res) {
        tweets = res.splice(0,10)

        twitterbox.append(tweets.map(function(d) {
          return maze.engine.template.tweet({tweet: d});
        }))

        $("#twitter-box .down").on('click', next_tweet);
        $("#twitter-box .up").on('click', prev_tweet);
        header.addClass('ready');
        slide_tweet();
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
