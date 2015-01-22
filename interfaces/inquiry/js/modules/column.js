;(function() {
  'use strict';

  mlab.pkg('maze.domino.modules');
  maze.domino.modules.Column = function(box) {
    domino.module.call(this);

    var _self = this;

    this.box = box.nanoScroller({contentClass: 'wrapper'}).find(".wrapper");
    this.upper_shadow = box.parent().find(".static-sticky .shadow");
    this.lower_shadow = box.parent().find(".column-footer .shadow");


    /*
      Handler for click on <span.link DOM elements inside the column
      when the column is in leading mode
    */
    this.link = function( event ){
      event.preventDefault();
      event.stopImmediatePropagation();
      if (maze.domino.controller.get('ui_lock'))
          return false;

      var scene_column = maze.domino.controller.get('scene_column'),
          link =  $( event.currentTarget ),
          link_column =  link.is('.vocab')? maze.VOC: link.is('.doc')? maze.DOC: maze.COMM, // order by pertinence
          selector = link.attr("data-id")
              .replace('star-','cont-')
              .replace(/italic-[0-9]+/g,'')
              .trim().split(/\s/).shift();

      maze.log('column: link', link_column, selector);


      if(scene_column.slave != link_column && scene_column.leading != link_column)
        maze.domino.controller.update('scene_column',{
            leading: scene_column.leading,
            slave: link_column
        });
      else if( link_column == maze.COMM ) {
          _self.dispatchEvent('notebook_choose',{
              type: maze.TYPE_NOTEBOOK_EDIT,
              id: link.attr('data-id').match(/star-\d+/g).shift().replace(/[^\d]/g,''), // first star-ID on clicked item when overlapping
              top: event.clientY,//link.offset().top,
              left: event.clientX// link.parent().offset().left + link.parent().width()
          });
        };

      // adjust column if needed
      _self.dispatchEvent('columnify', {
          callback: maze.move.show,
          args:[ '#' + selector,{
              callback: maze.move.scrollto,
              args:[ '#' + selector, {
                  callback: function(){ // TODO close previous slave_opened (maybe it is a column! )
                      // open little editor if it is a contribution?
                      if( link_column == maze.COMM ) {
                        _self.dispatchEvent('notebook_choose',{
                            type: maze.TYPE_NOTEBOOK_EDIT,
                            id: link.attr('data-id').match(/star-\d+/g).shift().replace(/[^\d]/g,''), // first star-ID on clicked item when overlapping
                            top: event.clientY,//link.offset().top,
                            left: event.clientX// link.parent().offset().left + link.parent().width()
                        });
                      };
                      if( scene_column.slave != link_column && scene_column.slave != maze.TEXT )
                          maze.move.close_and_hide( maze.columns[scene_column.slave].children() );
                  }
              }]
          }]
      });


    };

    /*
      Correct sticky problem while changing / updating column.
      Since each column has its own sticky, ovverride this method using _self.unsticky
    */
    this.unsticky = function(){
      // OVERRIDE LOCALLY
    };

    this.item_enter = function( event ){
      var link = $(event.currentTarget),
          link_id = link.attr('data-id')?link.attr('data-id'):link.attr('id');

      link_id=link_id.replace('cont-','star-');

      $('.link[data-id*=' + link_id + ']').addClass("hover");
      //console.log("%citem_enter > ", 'background-color: cyan', link_id);
    };


    this.item_leave = function( event ){
      var link = $(event.currentTarget),
          link_id = link.attr('data-id')?link.attr('data-id'):link.attr('id');

      link_id=link_id.replace('cont-','star-');

      $('.link[data-id*=' + link_id + ']').removeClass("hover");
      //_self.log("item_leave >", link_id);
    };


    this.link_enter = function( event ){
      var link = $(event.currentTarget),
          link_ids = link.attr('data-id').trim().split(' ');

      // _self.log("link_enter > ", link_ids);
      for( var i in link_ids ){
        if( link_ids[i].indexOf('vocab') != -1 )
          $('#column-voc .term[data-id*=' + link_ids[i] + ']').addClass("hover");
        else if ( link_ids[i].indexOf('doc') != -1 )
          $('#column-doc .doc[data-id*=' + link_ids[i] + ']').addClass("hover");
      }
    };


    this.link_leave = function( event ){
      var link = $(event.currentTarget),
          link_ids = link.attr('data-id').trim().split(' ');

      // _self.log("link_enter > ", link_ids);
      for( var i in link_ids ){
        if( link_ids[i].indexOf('vocab') != -1 )
          $('#column-voc .term[data-id*=' + link_ids[i] + ']').removeClass("hover");
        else if ( link_ids[i].indexOf('doc') != -1 )
          $('#column-doc .doc[data-id*=' + link_ids[i] + ']').removeClass("hover");
      }
    }


    this.sticky_update = function(data) {
      _self.sticky_title.html( data.title );
      _self.sticky
        .attr('class', data.classes)
        .attr('data-id', data.id);
      _self.sticky_height = _self.sticky.height();
    };


    this.sticky_adjust = function(data) {
      var p = {};

      if( typeof data.offset != "undefined" )
        p['top'] = data.offset;

      if( typeof data.shadow != "undefined" )
        p['padding-bottom'] = Math.min(10, data.shadow);

      _self.sticky.css(p);
    };


    /**
      @param options{
        sticky_type:'term', // [term|document]
        prefix: 'vocab-', // id prefix for the given stuff
        namespace: 'voc'
      }
    */
    this.scrolling = function( controller, options ){
      var items = controller.get('data_' + options.namespace +'IdsArray'), // TODO this is bad, but we cannot trust this array: $()controller.get('data_vocIdsArray'),
          has_selection = controller.get('active_selection').id,
          action = controller.get('scene_action'),
          first_item_height = this.sticky_height,
          first_visible_item = false,
          second_visible_item = false,
          has_pusher = false,
          last_item,
          sticky_adjust_data;

      // discard notebook
      has_selection && maze.domino.controller.update('active_selection',{});

      // ask for infinite scrolling
      if (action == maze.ACTION_STARTUP && ['doc','voc'].indexOf( options.namespace ) != -1) {
        last_item = $(document.getElementById(options.prefix + items[items.length - 1]));

        if(last_item.position().top - maze.vars.column_height < 150) {
          clearInterval(maze.timers['column_'+ options.namespace +'_infinite_scroll']);
          maze.timers['column_'+ options.namespace +'_infinite_scroll'] = setInterval(function() {
            if(controller.get( 'infinite_' + options.namespace ) == maze.STATUS_READY) {
              clearInterval(maze.timers['column_'+ options.namespace +'_infinite_scroll']);
              _self.dispatchEvent('infinite_scroll', {
                column: options.namespace
              });
            };
          }, 250);
        };
      };

      for( var i = 0 ; i < items.length; i++ ){
        var item = $( document.getElementById( options.prefix + items[i] ) ),
            t = item.length == 0? 0: item.position().top;

        if( t > maze.vars.column_height )
          break;

        var h = item.height();

        if( t + h <= 0 )
          continue;

        var item_id = item.attr('id'),
            item_title = item.find('.text').html();

        if( !first_visible_item ){
          this.sticky_height = item.find('.table').height();
          
          if( item_id + item_title + item.attr('class') != maze.cursor[options.namespace]){
            maze.cursor[options.namespace] = item_id + item_title + item.attr('class');

            first_visible_item = {
              id: item_id,
              title: item_title,
              height: this.sticky_height,
              offset:0,
              shadow:t< -10?10:Math.abs(t),
              classes: item.attr('class'),
              private_status: item.attr('data-private-status')
            };

            first_item_height = first_visible_item.height; //maze.log( ' > ', item_title.replace(/\s+/g,' '), t );
            _self.sticky_update(first_visible_item);
          } else {
            first_visible_item = {
              shadow: t< -10?10:Math.abs(t)
            };
          }
        } else if( !second_visible_item ){
          second_visible_item = true;
          //maze.log( ' >>> ', item.find('.text').html().replace(/\s+/g,' '), t, first_item_height, t < first_item_height, t-first_item_height);
          if( t < first_item_height ){ //maze.log( ' >>> ', item.find('.text').html().replace(/\s+/g,' '), t-first_item_height );
            sticky_adjust_data = {
              offset:t-first_item_height,
              shadow:0
            };

            _self.upper_shadow.css({top:-4});
            has_pusher = true
          } else if(t < first_item_height + 10){ // push shadow
            // maze.log( ' --> ', item.find('.text').html().replace(/\s+/g,' '), t-first_item_height );
            sticky_adjust_data = {
              shadow:(t-first_item_height),
              offset:0
            };
            has_pusher = true
          }
        }
      } // end for items.length

      if( !has_pusher && first_visible_item ){
        sticky_adjust_data = {
          offset:0,
          shadow:first_visible_item.shadow
        };
        _self.upper_shadow.css({top:-11});
      }
      if( !first_visible_item ){
        sticky_adjust_data = {
          shadow:0,
          offset:-600
        };
        _self.upper_shadow.css({top:-11});
      };

      if(sticky_adjust_data)
        _self.sticky_adjust(sticky_adjust_data);
    };


    this.listof = function( controller, options ){
      var previous_item = null,
          item = null,
          action = controller.get('scene_action'),
          force_open = [ maze.ACTION_NOTEBOOK, maze.ACTION_SEARCH ].indexOf( action ) != -1,
          settings = $.extend({
            selector:'.term', // css selector for the given item
            prefix: '#vocab-', // id prefix for the given stuff
            namespace: 'voc',
            is_editing: false,
            template: maze.engine.template.term,
            delay: 0,
            complete: function(){
              _self.log(' listof: completed, calling event "scrolling_' + settings.namespace +'"' );
              _self.toggle_shadow();
              _self.dispatchEvent( 'scrolling_' + settings.namespace );

              if (typeof settings.afterComplete === 'function')
                settings.afterComplete();
            }
          }, options ),
          _omissis = {},
          ids = controller.get('data_' + settings.namespace + 'IdsArray'),
          contents = controller.get('data_' + settings.namespace + 'Contents');

      _self.log('column.listof:',ids.length, settings.selector );
      settings.selector != ".chapter" && _self.unsticky();

      /*
        uhm..
        ids variable contains every 'must-in' item.
        So, (1) let's remove what should be removed, (2) let's add what have to be added
        according to ids sorting order.
      */
      $( settings.selector, _self.box ).each(function() {
        var item = $(this);
        if( item.hasClass('editor') )
          return true;

        if( ids.indexOf( item.attr('data-int-id') ) == -1 ) {
          if(item.attr('data-enable-slider'))
                _self.dispatchEvent('slider_leave_target', {id: item.attr('id')});
              
          maze.move.swipeout( item,{
            delay:settings.delay,
            callback:function(){
              item.remove();
              
              //_self.dispatchEvent('scrolling_voc');
            }
          });
          if( settings.delay < 500 )
            settings.delay += 70;
        }
      });

      if(settings.is_editing)
        return;

      for( var i in ids ){
          item = $( settings.prefix + ids[i] );

          if( item.length == 0 ){
            if( previous_item == null )
              _self.box.prepend( settings.template( contents[ ids[i] ] ) );
            else
              $( previous_item ).after( settings.template( contents[ ids[i] ] ) );

            item = $( settings.prefix + ids[i] );

            // only when displaying search results
            // following forces the opening of the paragraph if only the title matches
            if( item.hasClass('match') ){
              if( force_open ){
                if( !item.find('.paragraphs .match').length ) // no element matching the query. matches has been done on title only!
                  item.find('.paragraph').first().addClass('match');

                _omissis[ settings.prefix + ids[i] ] = item.find(".paragraph");
              } else
                item.removeClass('match');
            }

            var args = {
              delay: settings.delay
            };

            if( i == ids.length -1){
              args.callback = settings.complete;
              if( force_open && item.attr('data-status') == 'force-open' ){
                args.callback = maze.move.open,
                args.args = [ item, {
                  callback: settings.complete
                }]
              }
            } else if( force_open && item.attr('data-status') == 'force-open' ){
              args.callback = maze.move.open,
              args.args = [ item ]
            }

            if( action != maze.ACTION_STARTUP )
              maze.move.swipein( settings.prefix + ids[i], args );

          } else if( previous_item == null ){
            //_self.box.prepend( item );
          } else {
            $( previous_item ).after( item );
          }

          previous_item = settings.prefix + ids[i]; // maze.log(i, contents[ ids[i] ].name, ids[i] );
          if( settings.delay < 1000 )
            settings.delay += 70;
      }

      for( var i in _omissis )
        _self.dispatchEvent('omissify',{
            column: 'auto',
            items: _omissis[i],
            preview: action == maze.ACTION_NOTEBOOK && settings.namespace == "doc"
        });

      //

      return

    }

    /*
      Empty the column but leave the options.selector object intact.
      options.selector is a pseudo css selector
    */
    this.exempt = maze.domino.factory(function( options, complete ){
      var candidates = [],
          candidates_contents = {},
          candidates_update = {},
          stored = maze.domino.controller.get('data_' + options.namespace + 'Contents'),
          ids = maze.domino.controller.get('data_' + options.namespace + 'IdsArray'),
          delay = 0,
          difference; // difference between NUMBER OF candidates and actual elements stored.

      for(var i in options.selectors){ // id to be saved
        var id = options.selectors[i].replace(/[^\d]/g,'');
        candidates.push(id);
        candidates_contents[id] = stored[id]
      };

      candidates_update['data_' + options.namespace + 'Contents'] = candidates_contents
      candidates_update['data_' + options.namespace + 'IdsArray'] = candidates

      // calculate difference
      difference = Math.min( 10, Math.abs( candidates.length - ids.length ) );

      // todo. Sorry for this!
      maze.domino.controller.update(candidates_update);

      // delay accor  ding to real number of visible exempted
      setTimeout( complete, difference*100 );
    });


    this.bulkClose = maze.domino.factory(function( options, complete ){
      var diff,
          count = 0;

      maze.domino.controller.get('data_' + options.namespace + 'IdsArray').forEach(function(id) {
        id = ['#', options.namespace, '-', id].join('');
        if (options.selectors.indexOf(id) < 0) {
          maze.move.close(id);
          count++;
        }
      });

      // calculate difference
      diff = Math.min(10, count);

      setTimeout(complete, diff * 100);
    });


    this.empty = maze.domino.factory(function( options, complete ){
      _self.box.stop().animate({opacity:0},{easing:maze.move.easing, duration:250, complete:function(){
        _self.box.empty();
        _self.box.css({'opacity':1});
        _self.unsticky();
        complete();
      }});
    });


    this.hide = maze.domino.factory(function( options, complete ){
      _self.box.stop().animate({opacity:0},{
        easing:maze.move.easing,
        duration:250,
        complete:function(){
          _self.unsticky();
          complete();
        },
        queue:false
      });
    });


    this.reset = maze.domino.factory(function( options, complete ){
      _self.box.find(".opened, .preview").removeClass("opened preview").find(".ellipsis").hide();
      complete();
    });


    this.show = maze.domino.factory(function( options, complete ){
      _self.box.stop().animate({opacity:1},{easing:maze.move.easing, duration:250,complete:complete,queue:false});
    });


    this.toggle_shadow = function(){
      var scrolltop = _self.box.scrollTop(),
          overflow_offset = _self.box[0].scrollHeight - scrolltop - maze.vars.column_height;

      overflow_offset > 0 ? _self.lower_shadow.removeClass('hide'): _self.lower_shadow.addClass('hide');

      if( scrolltop == 0 ){
        _self.upper_shadow.css({top:-11});
      }
    }

    /*

      Different behavious according to column
      ----

    */
    this.startup = {};
    this.leader = {}
    this.slave = {};
    this.search = {};
    this.notebook = {};


    this.startup.scroll = this.leader.scroll = this.slave.scroll = this.search.scroll = this.notebook.scroll = function(){
      _self.log('override me please ')
    }


    /*

      static sticky behavious according to column
      ----

    */
    this.sticky_preview = function( event ){
      event.preventDefault();
      event.stopImmediatePropagation();
      if (maze.domino.controller.get('ui_lock'))
        return false;

      var action = maze.domino.controller.get('scene_action'),
          item = $( '#' + _self.sticky.attr('data-id') );

      _self.sticky.addClass('preview');

      if( action == maze.ACTION_NOTEBOOK || action == maze.ACTION_SEARCH )
        maze.move.show_collapsed( item,{
          callback: maze.move.scrollto,
          args:[ item ]
        });
      else
        maze.move.show( item,{
          callback: maze.move.scrollto,
          args:[ item ]
        });
    };


    this.toggle_preview = function(e) {
      e.preventDefault();
      e.stopImmediatePropagation();
      if (maze.domino.controller.get('ui_lock'))
        return false;

      var item = $(e.currentTarget).closest(".item"),
          id = item.attr('data-id') || item.attr('id');

      if(item.hasClass('match')) // SEARCH / NOTEBOOK
        maze.move.toggle_collapsed('#' + id, {});
      else if(item.hasClass('opened') || item.hasClass('leader')) // OTHER
        maze.move.toggle_open('#' + id, {});
      else
        maze.move.toggle_preview('#' + id,{});
    };


    this.read_more = function(e) {
      e.preventDefault();
      e.stopImmediatePropagation();
      if (maze.domino.controller.get('ui_lock'))
        return false;

      var item = $(e.currentTarget).closest(".item");
      maze.move.open(item, {});
    };
    

    this.read_less = function(e) {
      e.preventDefault();
      e.stopImmediatePropagation();
      if (maze.domino.controller.get('ui_lock'))
        return false;

      var item = $(e.currentTarget).closest(".item");
      maze.move.scrollto(item,{});
      maze.move.close(item, {});
    };


   


    /*
      A read more meant for 'documents 'and 'contribution'.
      Please use at your own risk.
      To be used only in slave opened mode.
    */
    this.read_more_with_slides = function(e) {
      e.preventDefault();
      e.stopImmediatePropagation();
      if (maze.domino.controller.get('ui_lock'))
        return false;

      var item = $(e.currentTarget).closest('.item'),
          id = item.attr('id'),
          namespace = id.replace(/[\-\d]/g,''),
          index = id.replace(/[^\d]/g,''), // integer id of the idSArray
          type = namespace == 'doc'? 'document': 'contribution';

      _self.dispatchEvent( 'slider_init', {
        selector: '#' + id,
        slide: 0,
        type: type
      });
      
      _self.bulkClose({
        namespace: namespace,
        selectors: ['#' + id],
        callback: maze.move.open,
        args: [
          item,
          {
            callback: maze.move.inject,
            args: [
              item,
              {
                callback: function() {
                  
                  _self.dispatchEvent('execute_slider_to', {
                    selector: '#' + id,
                    index: item.find('.slides-wrapper').attr('data-current-index') || 0
                  });
                }
              }
            ]
          }
        ]
      });
    };


    maze.on("mouseenter", ".item", _self.item_enter );
    maze.on("mouseleave", ".item", _self.item_leave );
  };
})();
