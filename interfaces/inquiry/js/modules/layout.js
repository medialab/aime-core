;(function() {
  'use strict';

  mlab.pkg('maze.domino.modules');
  maze.domino.modules.Layout = function(controller) {
    domino.module.call(this);

    var _self = this,
        _columns = {
          text: controller.addModule(maze.domino.modules.ColumnText),
          voc: controller.addModule(maze.domino.modules.ColumnVoc),
          doc: controller.addModule(maze.domino.modules.ColumnDoc)
        };

    var columnify = maze.domino.factory(function( options, complete ){

      var action = controller.get('scene_action');

      switch (action){
        case maze.ACTION_STARTUP:
          $(".column").removeClass("slave_opened         closed leader search notebook").addClass("startup");
          break;

        case maze.ACTION_SEARCH:
          $(".column").removeClass("slave_opened startup closed leader        notebook").addClass("search");
          break;

        case maze.ACTION_NOTEBOOK:
          $(".column").removeClass("slave_opened startup closed leader search         ").addClass("notebook");
          break;

        case maze.ACTION_SET_TEXT_LEADER:
        case maze.ACTION_SET_VOC_LEADER:
        case maze.ACTION_SET_DOC_LEADER:
        case maze.ACTION_SET_COMM_LEADER:

          $(".column").each( function(i,e){
            var el = $(this),
              column = el.attr("data-column");
            if( column == controller.get('scene_column').leading ){
              el.removeClass("slave_opened search closed startup notebook").addClass("leader");
            } else if( column == controller.get('scene_column').slave ){
              el.removeClass("leader closed search startup notebook").addClass("slave_opened");
            } else {
              el.removeClass("leader slave_opened search startup notebook").addClass("closed");
            }
          });
          break;
      }
      clearTimeout( maze.timers.columnify );
      maze.timers.columnify = setTimeout( complete, 500);
    });

    /*

        Add omissis between items
        ---
        Check for '.match' css selector, and fill the "empty spaces" with the omissis element
        defined by the handlebar function maze.engine.template.omissis

        @param event.data.items   - a jquery collection
        @param event.data.column  - the column name
        @param event.data.preview   - force the preview for images and videos
    */
    this.triggers.events.omissify = function( controller, event ) {

      var counter = 0,
          last_item;

      if( event.data.items ){

        event.data.items.each( function( i, el ){
          if( el.className.indexOf("match") == -1){

            counter++;
          } else {

            var item = last_item = $(el);

            if( event.data.preview ){
              maze.move.inject_preview( item );
            }

            if( counter > 0 ){
              item.find('.content').prepend( maze.engine.template.omissis({
                paragraph: item.attr('id'),
                column: event.data.column,
                num:counter
              }));
              counter = 0;
            }
          }

        });

        if( last_item && counter > 0 ){
          last_item.find('.content').append( maze.engine.template.omissis({
              paragraph: last_item.attr('id'),
              column: event.data.column,
              num:counter
          }))
        }

      }
    }

    this.triggers.events.unomissify = function( controller, event ) {
      $(".omissis").remove();
    }


    this.triggers.events.refill_paragraph = function( controller, event ){
      _self.dispatchEvent('lock');

      var paragraph = event.data.paragraph,
          item;

      switch( event.data.column ){
        case maze.TEXT:
          item = $('#' + paragraph.id );
          break;
        case maze.VOC:
          item = $('#tp-' + paragraph.id );
          break;
        case maze.DOC:
          item = $('#dp-' + paragraph.id );
          break;
        default:
          maze.error('refill_paragraph FAILED, no column found in "event.data":', event.data );
          return;
      }

      if( event.data.column == maze.DOC && [maze.ITEM_TYPE_REFERENCE, maze.ITEM_TYPE_IMAGE, maze.ITEM_TYPE_VIMEO, maze.ITEM_TYPE_ISSUU ].indexOf( paragraph.type ) != -1  ){
        _self.log("triggers.events.refill_paragraph: annotated an unselectable item ...", paragraph );

        if(event.data.contributions.length) {
          item.addClass('annotated');
          item.attr('data-notes', event.data.contributions );
        } else {
          item.removeClass('annotated');
          item.attr('data-notes', null );
        }

      } else {
        _self.log("triggers.events.refill_paragraph: replacing paragraph.content ...", paragraph);
        item.find(".content").html( maze.engine.template.paragraph( paragraph ) );
      }
      _self.dispatchEvent('unlock');

    }

    this.triggers.events.contribution_deleted = function( controller, event ){
      // $('.star[data-id*=star-' + event.data.id +']').each( function( i, el){
      //   // contains only given star?
      //   var item = $(el),
      //       ids = item.attr('data-id');

      //   if( ids.trim().split(" ").length == 1 ){
      //     var e = this.parentNode;

      //     e.replaceChild( this.firstChild, this)
      //     e.normalize();
      //   } else {
      //     item.removeClass('star');
      //     item.attr('data-id', ids.replace(/star-\d+ /g,'') );
      //   }
      // });
      // $('.paragraph[data-notes*=' + event.data.id +']').removeClass('annotated').attr('data-notes','');
    }


    this.triggers.events.columnify = function( controller, e ) {
      columnify( e.data );
    }

    this.triggers.events.sticky_hide = function( controller, event ){
      maze.move.fadeout( '#static-text',{
        callback:_columns.text.unsticky
      });
    }

    this.triggers.events.sticky_show = function( controller ){
      maze.move.fadein( '#static-text', {
        callback:function(){
          _self.dispatchEvent('scrolling_text')
        }
      });
    }

    this.triggers.events.notebook_add_contribution = function( controller ) {
      var scene_column = controller.get('scene_column'),
          selection = controller.get( 'active_selection' ),
          action;


      maze.domino.controller.update('scene_column',{
        leading: selection.column,
        slave: maze.COMM
      });

      columnify({
        callback: function(){
          // TODO open edit
          _self.dispatchEvent('notebook_show_contribution_editor')
        }
      });
    }




    this.triggers.events.resized = function(){
      $('.column .box').height( maze.vars.column_height );
    }

    this.triggers.events.unlock = function(){
      clearTimeout( maze.timers._triggers_events_lock );
      // $("#lock").stop().hide();
      // $().toastmessage("cleanToast");
      $('.toast-item-wrapper.toast-sticky').remove();
    }

    this.triggers.events.lock = function(){
      //$("#lock").stop().show();
      maze.toast( maze.i18n.translate('loading'),{sticky:true});
      //clearTimeout( maze.timers._triggers_events_lock );
      //maze.timers._triggers_events_lock = setTimeout( function(){
        //maze.toast('connection troubles');
      //  _self.dispatchEvent('unlock');
      //}, 5600);
    }

    this.triggers.events.extract_inlinks = function(controller) {
      var scene_item_column = controller.get('scene_item').column,
          selector = controller.get('scene_item').id,
          namespace = scene_item_column == maze.VOC? 'voc': scene_item_column == maze.DOC? 'doc': 'cont',
          contents = maze.domino.controller.get('data_'+ namespace +'Contents'),
          inlinks = {
            vocab: [],
            doc:[],
            com:[],
            star:[]
          };
      console.log('%c(Layout) @extract_inlinks', 'color:black;background-color:gold');
      /*
        1. add the selector itself (a glossary for the voc)
      */
      if(scene_item_column == maze.VOC)
        inlinks.vocab = controller.get('scene_glossary').slice(0);
      else if(scene_item_column == maze.DOC)
        inlinks.doc = [selector.replace(/[^0-9]/g,'')];
      else if(scene_item_column == maze.COMM)
        inlinks.star = [selector.replace(/[^0-9]/g,'')];

      /*
        2. extract in-dom links
      */
      $(selector).find('.link').each( function(i, e) {
        var data_ids = $(this).attr('data-id').trim().split(' ');
        for(var i in data_ids){
          var id = data_ids[i].replace(/[^0-9]/g,''),
              type = data_ids[i].slice(0, data_ids[i].indexOf("-"));

          if(typeof inlinks[type] != "undefined")
            inlinks[type].push(id);
        }
      });

      /*
        3. extract links from data contents
      */
      for(var i in contents){

        // ALEEEEERT! DIRTY!
        if (contents[i].cited_by_voc)
          inlinks.vocab = inlinks.vocab.concat(contents[i].cited_by_voc);

        if( !contents[i].inlinks )
          continue;

        for( var j in contents[i].inlinks){
          if(j == 'from_voc')
            inlinks.vocab = inlinks.vocab.concat(contents[i].inlinks[j]);
          if(j == 'from_doc')
            inlinks.doc = inlinks.doc.concat(contents[i].inlinks[j]);
          if(j == 'from_cont')
            inlinks.star = inlinks.star.concat(contents[i].inlinks[j]);
        };
      };

      /* extract data links */
      _self.dispatchEvent('fill_inlinks', inlinks);
    };


    this.triggers.events.scene_updated = function(controller) {

      _self.dispatchEvent([
        'lock',
        'text_match_clear',
        'match_clear',
        'unomissify',
        // 'delete_contribution',
        'slider_disable',
        'slider_hide'
      ]);

      if( controller.get('scene_action') != maze.ACTION_SET_VOC_LEADER )
        _self.dispatchEvent('scene_store',{ scene_glossary:[]})

      if( controller.get('scene_action') != maze.ACTION_SET_DOC_LEADER )
        maze.domino.controller.update('scene_slide', '0');

      switch (controller.get('scene_action')) {
        case maze.ACTION_STARTUP:
          _columns.text.hide();
          _columns.voc.empty({
            delay:100
          });
          _columns.doc.empty({
            delay:200,
            callback: columnify,
            args:[{
              callback: function() {
                _self.dispatchEvent( 'fill_startup' )
                _columns.text.show();
                _self.dispatchEvent('sticky_show');
              }
            }]
          });


          break;
        case maze.ACTION_SEARCH:
            var query = controller.get('scene_query');
            _self.log( 'triggers.events.scene_updated', query );


            _columns.text.hide();
            _columns.voc.empty({
              delay:100
            });
             _columns.doc.empty({
              delay:200,
              callback:columnify,
              args:[{
                callback:function(){
                  _self.dispatchEvent('fill_search',{query:query});
                }
              }]
            });

          // TODO
          break;

        case maze.ACTION_NOTEBOOK:

            _columns.text.hide();
            _columns.voc.empty({
              delay:100
            });
            _columns.doc.empty({
              delay:200,
              callback:columnify,
              args:[{
                callback:function(){
                  _self.dispatchEvent('fill_notebook',{query:query});

                }
              }]
            });

          // TODO
          break;

        case maze.ACTION_SET_TEXT_LEADER:
          // TODO controller.update('scene_query','' );
          var bookmark = controller.get('scene_bookmark');

          if( typeof bookmark.subheading == "undefined" ){
            bookmark.subheading = '#' + $( bookmark.chapter ).find(".subtitle").first().attr("id")
          }

          _columns.voc.empty({
            delay:100
          });
          _columns.doc.empty({
            delay:200
          });

          _self.dispatchEvent('sticky_hide');

          _columns.text.hide({
            callback: _columns.text.reset,
            args:[{
              callback: columnify,
              args:[{
                callback:maze.move.text.chapter.show,
                args:[ bookmark.chapter, {
                  callback: maze.move.text.subheading.open,
                  args:[ bookmark.subheading, {
                    callback: maze.move.text.subheading.scrollto,
                    args:[ bookmark.subheading, {
                      paragraph: bookmark.paragraph,
                      callback:_columns.text.show,
                      args:[{
                        callback:function(){
                          _self.dispatchEvent('unlock sticky_show');
                        }
                      }]
                    }]
                  }]
                }]
              }]
            }]

          })
          break;
        case maze.ACTION_SET_VOC_LEADER:
          var term = controller.get('scene_item').id,
              bookmark = controller.get('scene_bookmark'),
              term_id = term.replace(/[^\d]/g,''),
              glossary = controller.get('scene_glossary');

          if( glossary.indexOf(term_id) == -1)
            glossary.push(term_id);

          $(".term.leader", "#column-voc").removeClass("leader");
          $(term).addClass('leader');


          _columns.text.hide({});
          _self.dispatchEvent('sticky_hide');
          _columns.doc.empty({
            delay:100,
            callback: columnify,
            args:[{
              callback: _columns.voc.exempt,
              args:[{
                column: maze.VOC,
                namespace: 'voc',
                item: term.replace('#',''),
                selectors: glossary.map(function(i){ return 'vocab-'+i }),
                callback: maze.move.open, // scrollto is into setup_voc_as_leader (because of glossary terms)
                args:[ term, {
                  callback: function(){
                    _columns.voc.show({});

                    var matching_paragraphs = controller.get('data_vocContents')[+term_id].cited_by;


                    _self.dispatchEvent( 'setup_voc_as_leader extract_inlinks sticky_show' ); // scrolling_voc will be triggered by extract_inlinks trigger
                    _self.dispatchEvent( 'text_match_highlight', {
                      matching_paragraphs: matching_paragraphs,
                      selector:term
                    });

                    if( bookmark.subheading )
                      maze.move.text.subheading.scrollto( bookmark.subheading,{
                        callback: _columns.text.show
                      })
                    else
                      _columns.text.show({});
                  }
                }]
              }]
            }]
          });

          break;
        case maze.ACTION_SET_DOC_LEADER:
          var doc = controller.get('scene_item').id,
              doc_id = doc.replace(/[^\d]/g,''),
              slide = controller.get('scene_slide');

          $(".doc.leader").removeClass("leader");
          $(doc).addClass("leader");

          _columns.voc.empty({
            delay:100
          });
          _columns.text.hide({
            callback: columnify,
            args:[{
              callback: _columns.doc.exempt,
              args:[{
                column: maze.DOC,
                namespace: 'doc',
                item: doc.replace('#',''),
                selectors: [doc.substring(1)],
                callback: maze.move.scrollto,
                args:[ doc,{
                  callback: maze.move.unmatch,
                  args:[ doc,{
                    callback: maze.move.open,
                    args:[doc, {
                      callback: maze.move.inject,
                      args:[ doc,{
                        callback:function(){
                          var matching_paragraphs = controller.get('data_docContents')[+doc_id].cited_by;

                          // ALEEEEERT! DIRTY!
                          setTimeout(function() {
                            var matching_vocs = controller.get('data_docContents')[+doc_id].cited_by_voc;
                            if (!matching_vocs.length)
                              return;

                            maze.domino.controller.request('get_vocabulary_item', {
                              shortcuts: {ids: matching_vocs.map(function(v) { return 'voc_' + v; })},
                              success: function(data) {
                                var vocs = data.result,
                                    index = {};

                                vocs.forEach(function(v) {
                                  index[v.slug_id] = v;
                                });

                                setTimeout(function() {
                                  maze.domino.controller.update('data_vocContents', index);
                                  maze.domino.controller.update('data_vocIdsArray', vocs.map(function(v) { return v.slug_id; }));
                                }, 0);
                              }
                            });
                          }, 10);

                          _self.dispatchEvent( 'fill_references extract_inlinks sticky_show' ); // scrolling_voc will be triggered by extract_inlinks trigger
                          _self.dispatchEvent( 'slider_init',{
                            selector:doc,
                            slide: slide,
                            type:'document'
                          });
                          _self.dispatchEvent('slider_to',{
                            selector: doc,
                            index: slide || 0
                          });
                          _self.dispatchEvent( 'text_match_highlight', {
                            selector:doc,
                            matching_paragraphs: matching_paragraphs
                          });
                          _columns.text.show({});
                          _self.dispatchEvent('sticky_show unlock');
                       }
                      }]
                    }]
                  }]
                }]
              }]
            }]
          });
          // remove except, set element to open
          break;


      }

      _columns.text.toggle_shadow();
      _columns.voc.toggle_shadow();
      _columns.doc.toggle_shadow();
    };




    maze.on('click', '#header .logo', function( event ){
      _self.dispatchEvent('scene_update',{
        scene_action: maze.ACTION_STARTUP,
        scene_query: '',
        scene_bookmark: {},
        scene_column:{}
      });
    });

  };
})();
