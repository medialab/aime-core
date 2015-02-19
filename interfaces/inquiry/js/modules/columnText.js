;(function() {
  'use strict';

  mlab.pkg('maze.domino.modules');
  maze.domino.modules.ColumnText = function() {
    maze.domino.modules.Column.call(this, $('#column-text .box'));

    var _self = this,
        _startup = {
            chapter:{},
            subheading:{}
        },
        _leader = {
            chapter:{},
            subheading:{}
        },
        _slave_opened = {
            chapter:{},
            subheading:{}
        },
        _search = {
            chapter:{},
            subheading:{}
        },
        _closed = {},
        _sticky = {
            chapter:{},
            subheading:{}
        };

    this.chapter = $("#static-text .chapter");
    this.chapter_title = $("#static-chapter-title");
    this.chapter_number = $("#static-chapter-number");
    this.chapter_shadow = $("#static-text .chapter-shadow");

    this.subheading = $("#static-subheading");
    this.subheading_title = $("#static-subheading-title");
    this.subheading_shadow = $("#static-subheading .subtitle-shadow");

    this.sticky_chapter = { height: 50};
    this.sticky_subheading = { height: 50};

    this.chapter_cache = {
      offset:-100000,
      shadow:false
    }





    this.sticky_chapter_update = function(data) { //console.log('%cupdating chapter', 'background-color:cyan', data.offset, data.title);
      console.log('%c@sticky_chapter_update', 'color: red; background:gainsboro',data.title, data.height);
      _self.sticky_chapter = data;
      _self.chapter_title.html(data.title);
      _self.chapter_number.html(data.number);
      _self.chapter.attr('data-id', data.id);
      _self.chapter.css({
        top: 0
      });
    };


    this.sticky_chapter_adjust = function(data) { //console.log('%cadjusting chapter', 'background-color:gold', data.offset)
      if( typeof data.offset != "undefined" && data.offset != _self.chapter_cache.offset ){
        _self.chapter_cache.offfset = data.offset;
        _self.chapter.css({
          top: data.offset
        });
      }

      if( typeof data.shadow != "undefined" && data.shadow==0 != _self.chapter_cache.shadow ){
        _self.chapter_cache.shadow = data.shadow==0;
        _self.chapter_shadow.css({
          opacity: data.shadow==0? 0: 1
        });
      }
      $.extend(_self.sticky_chapter, data);
    };


    this.sticky_subheading_update = function(data) {// console.log('%c@sticky_subheading_update', 'color: red; background:orange',data.title);
      _self.subheading_title.html(data.title);
      _self.subheading.attr('class', data.classes).attr('data-id', data.id);
      _self.sticky_subheading = data;
    };


    this.sticky_subheading_adjust = function(data) {
    // console.log('%cadjusting subheading', 'background-color:gold', data.offset)
      if( typeof data.offset != "undefined")
        _self.subheading.css({
          top: data.offset
        });

      if( typeof data.shadow_offset != "undefined")
        _self.subheading_shadow.css({
          bottom: data.shadow_offset
        });
      $.extend(_self.sticky_subheading, data);
    };


    this.triggers.events.sticky_chapter_update = function(controller, e) {
      _self.sticky_chapter_update(e.data);
    };


    this.triggers.events.sticky_chapter_adjust = function(controller, e) {
      _self.sticky_chapter_adjust(e.data);
    };


    this.triggers.events.sticky_subheading_update = function(controller, e) {
      _self.sticky_subheading_update(e.data);
    };


    this.triggers.events.sticky_subheading_adjust = function(controller, e) {
      _self.sticky_subheading_adjust(e.data);
    };


    _self.unsticky = function(){
      _self.sticky_subheading_adjust({ offset:-1000});
      _self.sticky_chapter_adjust({ offset:-1000});
    }




    /*

        Text matches highighjt
        ---

        Normally the server response for bookitems "matching" objects to a search query
        does not contain the full text, but only an array of matches objects:
        [
          {
            "id":"36939",
            "type":"4",
            "matches":[
              621,

            626
            ]]
          },
          ...
        ]

        Mathes object are then passed as <event.data> to this listener,
        which handles the substring replacement by itself.

    */
    this.triggers.events.text_matches_highlight = function( controller, event ){
        var matches = event.data.ids,
            contents = controller.get('data_bookContents'),
            query = controller.get('scene_query'),
            paragraph,
            subheading,
            ellipsis,
            chapter,
            _omissis = {};

        _self.log('text_matches_highlight:', matches.length, 'matches found');

        for(var i=0; i < matches.length; i++){
            var el = $(document.getElementById(matches[i]));
            if(!el.length)
                continue;
            // console.log('elemento', el, el.length);
            if(el.hasClass('paragraph')) {
                var subtitle = el.addClass('match')
                    .closest(".subtitle").addClass("match");

                subtitle.closest(".chapter").addClass("match");

                console.log('el position', el.index(), el.siblings('.paragraph').length, subtitle[0].id)
                // if( typeof _omissis[ subheading.attr('id') ] == "undefined" )
                //         _omissis[ subheading.attr('id') ] = subheading.find(".paragraph");
                el.highlight(query);
            }

        }
        _self.show({delay:50});
        return;
        for( var i in matches ){
            var el = $( document.getElementById( matches[i].id ) ),
                content = maze.fn.grab( contents, function(e){ return e.id == matches[i].id; }).content,
                slices = [];

            if( !content )
              continue;

            for( var j in matches[i].matches )
                slices.push(
                    content.substring(
                        matches[i].matches[j][0],
                        matches[i].matches[j][1]
                    )
                );

            switch( matches[i].type ){
                case maze.CHAPTER:
                    //el.addClass("match");
                    continue;

                case maze.SUBHEADING:
                    //el.addClass("match");
                    subheading = el.addClass("match"); subheading.parent().addClass("match");
                    chapter = subheading.closest(".chapter").addClass("match");
                    paragraph = subheading.find(".paragraph").first().addClass("match"); paragraph.parent().addClass("match");

                    break;

                case maze.PARAGRAPH:
                    paragraph = el.addClass("match"); paragraph.parent().addClass("match");
                    subheading = paragraph.closest(".subtitle").addClass("match"); subheading.parent().addClass("match");
                    chapter = subheading.closest(".chapter").addClass("match");

                    if( slices.length ){
                      for( var j in slices )
                        paragraph.highlight( slices[j] );
                    } else {
                      paragraph.highlight(query);
                    }

                    if( typeof _omissis[ subheading.attr('id') ] == "undefined" )
                        _omissis[ subheading.attr('id') ] = subheading.find(".paragraph");
                    break;
            }
        };
        //maze.log( highlights );


        /*for( var i in event.data ){
            if( event.data[i].type == maze.PARAGRAPH ){
                paragraph = $( document.getElementById( event.data[i].id ) ).addClass("match");
                subheading = paragraph.closest(".subtitle").addClass("match");
                chapter = subheading.closest(".chapter").addClass("match");

                paragraph.parent().addClass("match"); // TODO add this to LESS stylesheet instead
                subheading.parent().addClass("match");

                if( typeof _omissis[ subheading.attr('id') ] == "undefined" )
                    _omissis[ subheading.attr('id') ] = subheading.find(".paragraph");

                continue;
            } else if( event.data[i].type == maze.CHAPTER ){
                $( document.getElementById( event.data[i].id ) ).addClass("match")
                continue;
            }
            // PARAGRAPHS?
            $("#" + event.data[i].id ).addClass("match").parent().parent().addClass("match")


        }*/

        for( var i in _omissis )
            _self.dispatchEvent('omissify',{
                column: maze.TEXT,
                items: _omissis[i]
            });




        _self.show({delay:250});
    }

    this.triggers.events.text_match_highlight = function( controller, event ){
        var data_id = event.data.selector.substring(1).replace('cont','star'),
            paragraph,
            subheading,
            chapter,
            _omissis = {};
        _self.log('searching text column for .link[data-id*="' + data_id + '"] objects...');
        // Search at the end with a space at the end to avoid root search

        var links = _self.box.find('.link[data-id*="' + data_id + ' "]').each( function(i,e){
            paragraph = $(this).addClass("match")
                .parent().addClass("match")
                .closest('.paragraph').addClass("match");

            subheading = paragraph
                .parent().addClass("match")
                .closest('.subtitle').addClass("match");

            if( typeof _omissis[ subheading.attr('id') ] == "undefined" )
                _omissis[ subheading.attr('id') ] = subheading.find(".paragraph");

            chapter = subheading
                .parent().addClass("match").
                closest('.chapter').addClass("match");
        });

        for( var i in _omissis )
            _self.dispatchEvent('omissify',{
                column: maze.TEXT,
                items: _omissis[i]
            });

        _self.toggle_shadow();
    }

    this.triggers.events.text_match_clear = function( controller ){
        _self.box.find(".match").removeClass("match"); // Remove previous match classes
        _self.box.unhighlight({ element: 'span', className: 'highlight' });
        _self.box.find(".chapter").removeClass('preview');
        _self.box.find(".subtitle").removeClass('preview opened').find(".paragraphs").css({display:'', height:'' });

    }

    this.scroll_id = 0;
    this.triggers.events.scrolling_text = function( controller, event ) {
        var chapters = controller.get('data_bookIdsArray'),
            action = controller.get('scene_action'),
            is_slave = controller.get('scene_column').slave == maze.TEXT || action == maze.ACTION_NOTEBOOK,
            extract_inlinks = action == maze.ACTION_SET_TEXT_LEADER,
            first_visible_chapter = false,
            second_visible_chapter = false,
            first_visible_subheading = false,
            second_visible_subheading = false, // i.e.the "pusher"
            pushing_subheading = false,
            current_page = false,
            current_bookmark = {};

        _self.scroll_id = _self.scroll_id+1;
        // console.log("_self.sticky_chapter.height", _self.sticky_chapter.height, "_self.sticky_subheading.height", _self.sticky_subheading.height)

        for( var i in chapters ){
            var chapter = $( document.getElementById( chapters[i] ) ),
                t = chapter.position().top;
            if( (action == maze.ACTION_SEARCH || is_slave) && !chapter.hasClass('match') ){
               continue;
            }
            if( t > maze.vars.column_height )
                break;

            var h = chapter.height();

            if( t + h <= 0 )
                continue;


            if( first_visible_chapter === false ) {


                current_page = chapter.attr('data-page');
                current_bookmark.chapter = '#' + chapters[i];
                _self.sticky_chapter.height = chapter.find('.title').height();//first_visible_chapter.height;
                    

                if( chapters[i] !== maze.cursor.chapter ){
                    maze.cursor.chapter = chapters[i];

                    first_visible_chapter = {
                        id: chapters[i],
                        number: chapter.find('.title .number' ).text(),
                        title: chapter.find('.title .text' ).html(),
                        height:  _self.sticky_chapter.height,
                        offset:0,
                        classes: chapter[0].className
                    }

                    _self.sticky_chapter_update(first_visible_chapter);

                } else {
                    first_visible_chapter = {
                        id: chapters[i]
                    }
                }



            } else if( second_visible_chapter === false ){
                // maze.log( '\n\n\nPUSHER', t, _self.sticky_chapter.height, _self.sticky_subheading.height, chapter.find('.title .text' ).text() );
                second_visible_chapter = true;
                pushing_subheading = true;
                if( t < _self.sticky_chapter.height ) {
                    _self.sticky_chapter_adjust({
                        scroll_id: _self.scroll_id,
                        offset: t - _self.sticky_chapter.height,
                        shadow:0
                    });
                    _self.sticky_subheading_adjust({
                        offset: -1000
                    });
                    // maze.log( '    ^ pushing chapter with chapter', chapter.find('.title .text' ).text().replace(/\s+/g,' '), t, _self.sticky_chapter.height );
                    _self.upper_shadow.css({top:-4});//-3}); // TODO make a function instead!

                } else if( t < _self.sticky_chapter.height + _self.sticky_subheading.height  ){
                    if( t < _self.sticky_chapter.height + 20  ) {
                       //maze.log( '    ^ pre-pushing chapter shadow', t, _self.sticky_chapter.height, (_self.sticky_chapter.height-t)/2 );
                    }
                    _self.sticky_chapter_adjust({
                        scroll_id: _self.scroll_id,
                        offset: 0,
                        shadow: Math.max( -10, (_self.sticky_chapter.height-t)/2 )
                    });
                    _self.sticky_subheading_adjust({
                        offset: t - _self.sticky_chapter.height - _self.sticky_subheading.height,
                        shadow_offset: 0
                    });
                    // maze.log( '    ^^^ pushing subheading with chapter', chapter.find('.title .text' ).text().replace(/\s+/g,' '), t, _self.sticky_chapter.height );
                    _self.upper_shadow.css({top:-11});

                } else if( t < _self.sticky_chapter.height + _self.sticky_subheading.height + 10 ){ // HIDE SUBHEADING SHADOW
                    // maze.log( '    ^^^^^ fade shadow', chapter.find('.title .text' ).text().replace(/\s+/g,' '), t, _self.sticky_chapter.height );

                    _self.sticky_chapter_adjust({
                        scroll_id: _self.scroll_id,
                        offset: 0
                    });
                    _self.sticky_subheading_adjust({
                        shadow_offset: -10 + ( -t + _self.sticky_chapter.height + _self.sticky_subheading.height + 10 )
                    });

                } else { // RUNTIME
                    // maze.log( '    ~ ~ ~ runtime', chapter.find('.title .text' ).text().replace(/\s+/g,' '), t, _self.sticky_chapter.height );

                    pushing_subheading = false;
                    /*_self.dispatchEvent('sticky_chapter_adjust',{
                        scroll_id: _self.scroll_id,
                        offset: 0,
                        shadow: -10
                    });*/
                     _self.upper_shadow.css({top:-11});
                }
            }
            //continue
                // TODO performance check

            var subheadings = controller.get('data_bookContents')[ chapters[i] ].children;
            for( var j in subheadings ){
                var subheading = $( document.getElementById( subheadings[j].id ) ),
                    ts = subheading.position().top;

                if( (action == maze.ACTION_SEARCH || is_slave) && !subheading.hasClass('match') ){
                    continue;
                }

                if( ts > maze.vars.column_height - 50 ) // 50 is the standard minimum visible height of a subheading. // TODO move it to global const!
                    break;

                var th = subheading.height();

                if( ts + th < _self.sticky_chapter.height )
                    continue;


                if( first_visible_subheading === false ) {
                    current_page = subheadings[j].page;
                    current_bookmark.subheading = '#' + subheadings[j].id;

                    if( subheadings[j].id !== maze.cursor.subheading ){
                        $('#' + maze.cursor.subheading).removeClass('leader');
                        subheading.addClass('leader');
                        maze.cursor.subheading = subheadings[j].id;

                        first_visible_subheading = {
                            id: subheadings[j].id,
                            title: subheading.find('.table .text' ).html(),
                            height: subheading.find('.table').height(),
                            offset:0,
                            classes: subheading[0].className
                        }
                        _self.sticky_subheading.height = first_visible_subheading.height;
                        _self.sticky_subheading_update(first_visible_subheading);

                    } else {
                        first_visible_subheading = {
                            id: subheadings[j].id
                        }
                    }

                } else if( second_visible_subheading === false ){
                    second_visible_subheading = true;
                    //maze.log('    ** subheading pushing: ', subheading.find('.table .text' ).text().trim().replace(/\s+/g,'') )

                    if( !pushing_subheading ){
                        // maze.log( _self.scroll_id, 'pushing subheading, top:', ts, _self.sticky_chapter.height, _self.sticky_subheading.height);
                        if( ts < _self.sticky_chapter.height + _self.sticky_subheading.height ){
                            // maze.log( _self.scroll_id, '    - overlap');
                            // maze.log( _self.scroll_id, ' start pushing subheading', t, ts , _self.sticky_chapter.height, _self.sticky_subheading.height, _self.sticky_chapter.height + _self.sticky_subheading.height);
                            _self.sticky_subheading_adjust({
                                offset: ts - _self.sticky_chapter.height - _self.sticky_subheading.height,
                                shadow_offset:0
                            });
                            _self.sticky_chapter_adjust({
                                scroll_id: _self.scroll_id,
                                offset: 0,
                                shadow:  ts == _self.sticky_chapter.height?0: -10
                            });

                        } else if( ts < _self.sticky_chapter.height + _self.sticky_subheading.height + 10 ){
                            // maze.log( _self.scroll_id, '    - quasi overlap');
                            _self.sticky_subheading_adjust({
                                shadow_offset:-10 + ( -ts + _self.sticky_chapter.height + _self.sticky_subheading.height + 10 )
                            });

                        } else {
                            // maze.log( _self.scroll_id, '    - runtime?');
                            _self.sticky_chapter_adjust({
                                scroll_id: _self.scroll_id,
                                offset: 0,
                                shadow: 0
                            });
                            _self.sticky_subheading_adjust({
                                offset:0,
                                shadow_offset:-10
                            });
                        }
                        _self.upper_shadow.css({top:-11});
                    }
                }



            }


        }
        if(first_visible_chapter === false )
            return;
        /*
            Dispatch Event INLINK extraction
        */
        if(extract_inlinks){
            clearTimeout( maze.timer.columnText_extract_inlink );
            maze.timer.columnText_extract_inlink = setTimeout( function(){
                _self.dispatchEvent('text_extract_inlinks');
            }, 250);
         };

        /*
            Dispatch Event page changed
        */
        if( current_page && action == maze.ACTION_SET_TEXT_LEADER){
          clearTimeout( maze.timer.columnText_scrolling_text );
          maze.timer.columnText_scrolling_text = setTimeout( function(){
            _self.dispatchEvent('scene_store', {
                scene_page: current_page,
                scene_bookmark: current_bookmark
            });
          }, 150);
        };

        if( second_visible_chapter === false && second_visible_subheading === false ){
          _self.sticky_chapter_adjust({
              scroll_id: _self.scroll_id,
              offset: 0,
              shadow: -10
          });
          _self.sticky_subheading_adjust({
              offset: 0,
              shadow_offset: -10
          });
        };

        if( !second_visible_subheading && !pushing_subheading ){
          _self.sticky_subheading_adjust({
              offset: 0,
              shadow_offset: -10
          });
           _self.sticky_chapter_adjust({
              scroll_id: _self.scroll_id,
              shadow: 0
          });
        };
    };


    this.triggers.events.text_extract_inlinks = function( controller ){console.log('%ctext_extract_inlinks', 'background-color:crimson;color: white')
        var chapters = controller.get('data_bookIdsArray'),
            scene_action = controller.get('scene_action'),
            sticky_chapter_height = _self.sticky_chapter.height,
            sticky_subheading_height = _self.sticky_subheading.height,
            inlinks = {
                vocab:[],
                doc:[],
                star:[]
            };

        if( scene_action != maze.ACTION_SET_TEXT_LEADER ){
          maze.log('columnText: quit text_extract_inlinks trigger, wrong Scene');
          return;
        }
        
        for( var i in chapters ){
            var chapter = $( document.getElementById( chapters[i] ) ),
                t = chapter.position().top;

            if( t > maze.vars.column_height )
                break;

            var h = chapter.height();

            if( t + h <= 0 )
                continue;

            var subheadings = controller.get('data_bookContents')[ chapters[i] ].children;
            for( var j in subheadings ){
                var subheading = $( document.getElementById( subheadings[j].id ) ),
                    ts = subheading.position().top;

                if( ts > maze.vars.column_height - 50 ) // 50 is the standard minimum visible height of a subheading. // TODO move it to global const!
                    break;

                var th = subheading.height();

                if( ts + th <= sticky_chapter_height )
                    continue;

                //_self.log( ts, th, subheadings[j].content, 'VISIBLE');
                subheading.find(".link:visible").each(function(i,e){
                    var link = $(e),
                        ids = link.attr( "data-id" ).split(/\s+/),
                        tl = link.position().top;
                    if( tl + ts < maze.vars.column_height -60 && tl + ts > sticky_chapter_height ){



                        for( var i = 0; i < ids.length; i++){
                            var d = ids[i].split("-");

                            if( d.length != 2 )
                                continue;

                            if( d[0] == "italic" )
                                continue;

                            //  §_self.log('  > ', link.text().replace(/[\s]+/g,' '), tl + ts );
                            inlinks[ d[0] ].push( d[1] );


                        }
                    }

                })
            }

        }
        maze.log( 'inlinks', inlinks);
        if( !inlinks.vocab.length && !inlinks.doc.length && !inlinks.star.length ){
            _self.dispatchEvent('clear', { // clear everything
                voc: true,
                doc: true,
                cont: true
            });
        } else {
            _self.dispatchEvent('fill_inlinks', inlinks );
        }

    }

    this.triggers.events.data_book_updated = function( controller ){
      _self.listof( controller, {
        selector: '.chapter',
        prefix: '#',
        namespace:'book',
        template: maze.engine.template.chapter
      });

    };

    this.triggers.events.text_scrollto = function( controller ){
        var bookmark = controller.get('scene_bookmark');

        _self.dispatchEvent('lock');

        maze.move.text.chapter.show( bookmark.chapter, {
            callback:maze.move.text.subheading.scrollto,
            args:[ bookmark.subheading, {
                callback:maze.move.text.subheading.open,
                args:[ bookmark.subheading, {
                    callback:_self.dispatchEvent.bind(_self),
                    args:['unlock scrolling_text']
                }]
            }]
        });

    }


    /*

        Local Controllers
        ---

        Click handlers
    */


    _startup.chapter.toggle_preview = _leader.chapter.toggle_preview = function( event ){
        event.preventDefault();
        event.stopImmediatePropagation();
        if (maze.domino.controller.get('ui_lock'))
            return false;

        var chapter = $(event.currentTarget).parent().parent().parent();
        maze.move.text.chapter.toggle_preview( chapter );
    };

    _startup.subheading.toggle_preview = function( event ){
        event.preventDefault();
        event.stopImmediatePropagation();
        if (maze.domino.controller.get('ui_lock'))
            return false;

        var subheading = $(event.currentTarget).closest('.subtitle'),
            chapter = subheading.closest('.chapter'),
            subheading_update_data = {
              id: subheading.attr('id'),
              title: subheading.find('.table .text' ).html(),
              height: subheading.find('.table').height(),
              offset:0
            };

        maze.move.text.subheading.toggle_preview(subheading, {
          callback: function(){
            subheading_update_data.classes = subheading[0].className;
            //_self.sticky_subheading_update(subheading_update_data);

            _self.dispatchEvent('scene_store', {
              chapter: '#' + chapter.attr('id'),
              subheading: '#' + subheading.attr('id')
            });
          }
        });

              

    };


   _startup.subheading.set_leader = function( event ){
        event.preventDefault();
        event.stopImmediatePropagation();
        if (maze.domino.controller.get('ui_lock'))
            return false;

        var subheading = $(event.currentTarget).closest('.subtitle'),
            subheading_id = subheading.attr('data-id') || subheading.attr('id'),
            chapter = subheading.attr('data-id')? subheading.prev('.chapter'): subheading.closest('.chapter'),
            chapter_id = chapter.attr('data-id') || chapter.attr('id');

        _self.dispatchEvent('scene_update',
          {
            scene_action:maze.ACTION_SET_TEXT_LEADER,
            scene_column:{
              leading:maze.TEXT,
              slave:maze.VOC
            },
            scene_bookmark:{
              chapter: '#' + chapter_id,
              subheading: '#' +subheading_id
            }
          }
        );
    }


    _leader.subheading.toggle_preview = function( event ){
        event.preventDefault();
        event.stopImmediatePropagation();
        if (maze.domino.controller.get('ui_lock'))
            return false;

        var subheading = $(event.currentTarget).closest('.subtitle'),
            chapter = subheading.parent().parent(),
            subheading_update_data = {
              id: subheading.attr('id'),
              title: subheading.find('.table .text' ).html(),
              height: subheading.find('.table').height(),
              offset:0
            };

        maze.move.text.subheading.toggle_open(subheading,{
            callback: function(){
              $("#" + maze.cursor.subheading).removeClass('leader');
              subheading.addClass('leader');
              subheading_update_data.classes = subheading[0].className;

              //_self.sticky_subheading_update(subheading_update_data);

              _self.dispatchEvent('scene_store', {
                chapter: '#' + chapter.attr('id'),
                subheading: '#' + subheading.attr('id')
              });
            }/* bind(_self),
            args:[ 'scene_store', {
                scene_bookmark:{
                    chapter: '#' + chapter.attr('id'),
                    subheading: '#' + subheading.attr('id')
                }
            }]*/
        });
    }


    _leader.link = function( event ){
        event.preventDefault();
        event.stopImmediatePropagation();
        if (maze.domino.controller.get('ui_lock'))
            return false;

        var column = maze.domino.controller.get('scene_column'),
            link =  $( event.currentTarget ),
            link_column =  link.is('.vocab')? maze.VOC: link.is('.doc')? maze.DOC: maze.COMM, // order by pertinence
            selector = link.attr("data-id")
                .replace('star-','cont-')
                .replace(/italic-[0-9]+/g,'')
                .trim().split(/\s/).shift();

        if( column.slave != link_column )
            maze.domino.controller.update('scene_column',{
                leading: maze.TEXT,
                slave: link_column
            });

        _self.dispatchEvent( 'columnify',{
            callback: maze.move.show,
            args:[ '#' + selector,{
                callback: maze.move.scrollto,
                args:[ '#' + selector, {
                    callback: function(){ // TODO close previous slave_opened (maybe it is a column! )
                      // force sticky update
                      _self.dispatchEvent('scrolling_' + link_column.toLowerCase());

                      link_column.scrolling
                        if( column.slave != link_column )
                            maze.move.close_and_hide( maze.columns[column.slave].children() );
                    }
                }]
            }]
        });

        if( link_column == maze.COMM )
            _self.dispatchEvent('notebook_choose',{
                type: maze.TYPE_NOTEBOOK_EDIT,
                id: link.attr('data-id').match(/star-\d+/g).shift().replace(/[^\d]/g,''), // first star-ID on clicked item when overlapping
                top: event.clientY,//link.offset().top,
                left: event.clientX// link.parent().offset().left + link.parent().width()
            });

    }

    _startup.scroll = function( event ){
        _self.dispatchEvent('scrolling_text');
    };

    _leader.scroll = function( event ){
        _self.dispatchEvent('scrolling_text');
    };


    _slave_opened.chapter.toggle_preview = function( event ){
        event.preventDefault();
        event.stopImmediatePropagation();
        if (maze.domino.controller.get('ui_lock'))
            return false;

        var chapter = $(event.currentTarget).parent().parent().parent();
        maze.move.text.chapter.toggle_collapsed( chapter );
    }

    _slave_opened.subheading.toggle_preview = function( event ){
        event.preventDefault();
        event.stopImmediatePropagation();
        if (maze.domino.controller.get('ui_lock'))
            return false;

        var subheading = $(event.currentTarget).closest('.subtitle');
        maze.move.text.subheading.toggle_collapsed( subheading );
    };

    _slave_opened.subheading.set_leader = function( event ){
        event.preventDefault();
        event.stopImmediatePropagation();
        if (maze.domino.controller.get('ui_lock'))
            return false;

        var subheading = $(event.currentTarget).closest(".subtitle"),
            chapter = subheading.closest(".chapter"),
            scene_column = maze.domino.controller.get('scene_column'),
            data_id = maze.domino.controller.get('scene_item').id.substring(1),
            paragraph = subheading.find('.link[data-id*="' + data_id + '"]').closest(".paragraph");


        _self.dispatchEvent('scene_update',
          {
            scene_action:maze.ACTION_SET_TEXT_LEADER,
            scene_column:{
              leading:maze.TEXT,
              slave:scene_column.leading != maze.TEXT? scene_column.leading :maze.VOC
            },
            scene_bookmark:{
              chapter: '#' + chapter.attr('id'),
              subheading: '#' + subheading.attr('id'),
              paragraph:'#'+ paragraph.attr('id'),
            }
          }
        );
    };

    _slave_opened.subheading.omissis = function( event ){
        event.preventDefault();
        event.stopImmediatePropagation();
        if (maze.domino.controller.get('ui_lock'))
            return false;

        var subheading = $(event.currentTarget).closest(".subtitle"),
            chapter = subheading.closest(".chapter"),
            scene_column = maze.domino.controller.get('scene_column');

        _self.dispatchEvent('scene_update',
          {
            scene_action:maze.ACTION_SET_TEXT_LEADER,
            scene_column:{
              leading:maze.TEXT,
              slave:scene_column.leading != maze.TEXT? scene_column.leading :maze.VOC
            },
            scene_bookmark:{
              chapter: '#' + chapter.attr('id'),
              subheading: '#' + subheading.attr('id')
            }
          }
        );
    }

    _search.chapter.toggle_preview = function( event ){
        event.preventDefault();
        event.stopImmediatePropagation();
        if (maze.domino.controller.get('ui_lock'))
            return false;

        var chapter = $(event.currentTarget).closest('.chapter');
        maze.move.text.chapter.toggle_collapsed( chapter );
    }

    _search.subheading.toggle_preview = function( event ){
        event.preventDefault();
        event.stopImmediatePropagation();
        if (maze.domino.controller.get('ui_lock'))
            return false;

        var subheading = $(event.currentTarget).closest('.subtitle');
        maze.move.text.subheading.toggle_collapsed( subheading );
    };

    _search.subheading.set_leader = function( event ){
        event.preventDefault();
        event.stopImmediatePropagation();
        if (maze.domino.controller.get('ui_lock'))
            return false;


        var subheading = $(event.currentTarget).closest('.subtitle'),
            chapter = subheading.closest('.chapter'),
            paragraph = subheading.find('.paragraph.match').first();

        _self.dispatchEvent('scene_update',
          {
            scene_action:maze.ACTION_SET_TEXT_LEADER,
            scene_column:{
              leading:maze.TEXT,
              slave:maze.VOC
            },
            scene_bookmark:{
              chapter: '#' + chapter.attr('id'),
              subheading: '#' + subheading.attr('id'),
              paragraph:'#'+ paragraph.attr('id'),
            }
          }
        );
    };

    _search.subheading.omissis = function( event ){
        event.preventDefault();
        event.stopImmediatePropagation();
        if (maze.domino.controller.get('ui_lock'))
            return false;

        var subheading = $(event.currentTarget).closest(".subtitle"),
            chapter = subheading.closest(".chapter");

        _self.dispatchEvent('scene_update',
          {
            scene_action:maze.ACTION_SET_TEXT_LEADER,
            scene_column:{
              leading:maze.TEXT,
              slave:maze.VOC
            },
            scene_bookmark:{
              chapter: '#' + chapter.attr('id'),
              subheading: '#' + subheading.attr('id')
            }
          }
        );
    }

    _closed.open = function( event ){
      var chapter = $(event.currentTarget),
          scene_column = maze.domino.controller.get('scene_column');

      maze.domino.controller.update('scene_column',{
        leading:scene_column.leading,
        slave:maze.TEXT
      });

      _self.dispatchEvent('columnify',{
        callback: maze.move.text.chapter.show,
        args:[ chapter, {
          callback: maze.move.text.scrollto,
          args:[ chapter ]
        }]
      });

    };


    _sticky.chapter.toggle_preview = function( event ){
      event.preventDefault();
      event.stopImmediatePropagation();
      if (maze.domino.controller.get('ui_lock'))
        return false;
      var chapter = $( '#' + $(event.currentTarget).closest(".chapter").attr('data-id') );

      maze.move.text.chapter.show( chapter,{
        callback: maze.move.text.scrollto,
        args:[ chapter ]
      });
    }


    _sticky.subheading.toggle_preview = function( event ){
        event.preventDefault();
        event.stopImmediatePropagation();
        if (maze.domino.controller.get('ui_lock'))
            return false;
        var subheading = $( '#' + $(event.currentTarget).closest(".subtitle").attr('data-id') ),
            chapter = subheading.closest('.chapter');

        // _self.log({ chapter:"#" + chapter.attr("id"), subheading: "#" + subheading.attr("id") });
        maze.move.text.subheading.show(subheading, {
          callback:maze.move.text.subheading.scrollto,
          args:[ subheading, { callback:function(){

            _self.dispatchEvent('scene_store', {
              chapter: '#' + chapter.attr('id'),
              subheading: '#' + subheading.attr('id')
            });
          }}]
        });
    }

    _sticky.subheading.toggle_open = function( event ){
        event.preventDefault();
        event.stopImmediatePropagation();
        if (maze.domino.controller.get('ui_lock'))
            return false;
        var subheading = $( '#' + $(event.currentTarget).closest(".subtitle").attr('data-id') );

        // _self.log({ chapter:"#" + chapter.attr("id"), subheading: "#" + subheading.attr("id") });
        maze.move.text.subheading.toggle_open( subheading,{
            callback:function(){
                _self.dispatchEvent('scrolling_text');
            }
        });
    }


    /*
      Override the common read_more behaviou in column.js module
    */
    _self.read_more = function(e) {
      e.preventDefault();
      e.stopImmediatePropagation();
      if (maze.domino.controller.get('ui_lock'))
        return false;

      var item = $(e.currentTarget).closest(".subtitle");
      maze.move.open(item, {});
    };


    /*
      Override the common read_less behaviour in column.js module
    */
    _self.read_less = function(e) {
      e.preventDefault();
      e.stopImmediatePropagation();
      if (maze.domino.controller.get('ui_lock'))
        return false;

      var item = $(e.currentTarget).closest(".subtitle");

      maze.move.text.subheading.scrollto(item, {});
      maze.move.close(item, {});
    };


    /*
      
      Emulate click events on sticky (when sticky has pointer-e)
      ===
      
    */
    $("#column-text").click(function(event) {
      var chapter_id = _self.chapter.attr('data-id'),
          subheading_id = _self.subheading.attr('data-id'),
          chapter_bounds,
          subheading_bounds,
          chapter,
          subheading;

      if(chapter_id) {
        chapter_bounds = _self.chapter[0].getBoundingClientRect();
        subheading_bounds = _self.subheading[0].getBoundingClientRect();
          
        if(event.pageY > chapter_bounds.top && event.pageY < chapter_bounds.bottom && event.pageX > chapter_bounds.left && event.pageX < chapter_bounds.right) {
          event.stopImmediatePropagation();
          event.preventDefault();
        
          chapter = $('#' + chapter_id, _self.box);

          maze.move.text.chapter.show(chapter, {
            callback: maze.move.text.scrollto,
            args:[chapter]
          });
        } else if(subheading_id && event.pageX > subheading_bounds.left && event.pageX < subheading_bounds.right && event.pageY > subheading_bounds.top && event.pageY < subheading_bounds.bottom){
          event.stopImmediatePropagation();
          event.preventDefault();

          subheading = $('#' + subheading_id, _self.box);
          chapter = subheading.closest('.chapter');

          if(subheading.hasClass('match'))
            maze.move.text.subheading.scrollto( subheading );
          else
            maze.move.text.subheading.show(subheading, {
              callback:maze.move.text.subheading.scrollto,
              args:[ subheading, { callback:function(){
                _self.dispatchEvent('scene_store', {
                  chapter: '#' + chapter.attr('id'),
                  subheading: '#' + subheading.attr('id')
                });
              }}]
            });
        };
      };
    });

    maze.on("click", "#column-text .subtitle .read-more",  _self.read_more);
    maze.on("click", "#column-text .subtitle .read-less",  _self.read_less);

    maze.on("click", "#column-text.startup .static-sticky .chapter .title .toggle-preview", _sticky.chapter.toggle_preview );
    maze.on("click", "#column-text.startup .static-sticky .subtitle .toggle-preview", _sticky.subheading.toggle_preview );
    maze.on("click", "#column-text .static-sticky .action.set-leader", _startup.subheading.set_leader);
    maze.on("click", "#column-text:not(.leader) .action .set-leader", _startup.subheading.set_leader);

    maze.on("click", "#column-text.startup .chapter .title .toggle-preview", _startup.chapter.toggle_preview );
    maze.on("click", "#column-text.startup .subtitle .toggle-preview", _startup.subheading.toggle_preview );
    maze.on("click", "#column-text.startup .subtitle .set-leader", _startup.subheading.set_leader );

    maze.on("click", "#column-text.leader .static-sticky .chapter .title .toggle-preview", _sticky.chapter.toggle_preview );
    maze.on("click", "#column-text.leader .static-sticky .subtitle .toggle-preview", _sticky.subheading.toggle_open );
    maze.on("click", "#column-text.leader .chapter .title .toggle-preview", _leader.chapter.toggle_preview );
    maze.on("click", "#column-text.leader .subtitle .toggle-preview", _leader.subheading.toggle_preview );
    maze.on("click", "#column-text.leader .paragraph .link", _leader.link );


    maze.on("click", "#column-text.slave_opened .chapter .title .toggle-preview", _slave_opened.chapter.toggle_preview );
    maze.on("click", "#column-text.slave_opened .subtitle .toggle-preview", _slave_opened.subheading.toggle_preview );
    maze.on("click", "#column-text.slave_opened .subtitle .omissis", _slave_opened.subheading.omissis );

    maze.on("click", "#column-text.search .chapter .title .toggle-preview", _search.chapter.toggle_preview );
    maze.on("click", "#column-text.search .subtitle .toggle-preview", _search.subheading.toggle_preview );
    maze.on("click", "#column-text.search .subtitle .paragraph", _search.subheading.set_leader );
    maze.on("click", "#column-text.search .subtitle .omissis", _search.subheading.omissis );

    maze.on("click", "#column-text.notebook .chapter .title .toggle-preview", _search.chapter.toggle_preview );
    maze.on("click", "#column-text.notebook .subtitle .toggle-preview", _search.subheading.toggle_preview );
    maze.on("click", "#column-text.notebook .subtitle .paragraph", _search.subheading.set_leader );
    maze.on("click", "#column-text.notebook .subtitle .omissis", _search.subheading.omissis );

    maze.on("click", "#column-text.closed .chapter",  _closed.open );

    this.box.scroll( function( event ){
        _self.toggle_shadow();
        var scene_action = maze.domino.controller.get('scene_action'),
            has_selection = maze.domino.controller.get('active_selection').id;

        has_selection && maze.domino.controller.update('active_selection',{});

        _self.triggers.events.scrolling_text(maze.domino.controller);//_self.dispatchEvent('scrolling_text',{ action: scene_action });
    })





  };
})();
