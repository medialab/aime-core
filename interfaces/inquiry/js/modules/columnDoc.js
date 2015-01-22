;(function() {
  'use strict';

  mlab.pkg('maze.domino.modules');
  maze.domino.modules.ColumnDoc = function(controller) {
    maze.domino.modules.Column.call(this, $('#column-doc .box'));

    var _self = this,
        _startup = {},
        _leader = {},
        _slave_opened = {},
        _search = {},
        _closed = {},
        _sticky = {};

    this.sticky = $("#static-document .document");
    this.sticky_title = $("#static-document-title");
    this.sticky_height = 0;

    this.triggers.events.sticky_document_update = function( controller, e ){
      _self.sticky_update(e.data);
    };

    this.triggers.events.sticky_document_adjust = function( controller, e ){ //maze.log(e.data)
       _self.sticky_adjust(e.data);
    };


    this.triggers.events.setup_doc_as_leader = function(controller, event){};


    this.triggers.events.scrolling_doc = function( controller, event ) {
      _self.scrolling( controller,{
        sticky_type:'document', // [term|document]
        prefix: 'doc-', // id prefix for the given stuff
        namespace: 'doc'
      })
    };

    this.triggers.events.data_doc_updated = function(controller) {
      var col = controller.get('scene_column');
      _self.listof( controller, {
        selector: '.document',
        prefix: '#doc-',
        namespace:'doc',
        template: maze.engine.template.document,
        afterComplete: (
          (col.leading === maze.COMM) &&
          (col.slave === maze.DOC)
        ) ? function() {
          // Toggle preview!
          if (_self.box.find('.document').length)
            _self.box.find('.document .text.toggle-preview').click();
        } : undefined
      });
    };

    this.triggers.events.build_references = function(controller, event ) {
      for( var i in event.data.references ){
        var obj = event.data.references[i];
        $("[data-ref=ref-"+obj.rec_id+"]").html( obj.mla );
      }
    }

    this.box.on('scroll', function() {
      _self.scrolling(maze.domino.controller, {
        sticky_type: 'document', // [term|document]
        prefix: 'doc-', // id prefix for the given stuff
        namespace: 'doc'
      });
      _self.toggle_shadow();
    });


    _self.unsticky = function(){
      _self.dispatchEvent('sticky_document_adjust',{ offset:-1000});
    }

    /*
      Handle click on unselectable text, like pdf, images, iframes and citations
    */
    _leader.toggle_star = function( event ){
      event.preventDefault();
      event.stopImmediatePropagation();
      if (maze.domino.controller.get('ui_lock'))
        return false;

      var paragraph =  $(event.currentTarget).closest(".paragraph");

      if( paragraph.hasClass('annotated') )
        _self.dispatchEvent('notebook_choose',{
          type: maze.TYPE_NOTEBOOK_EDIT,
          id: paragraph.attr('data-notes').split(' ').shift().replace(/[^\d]/g,''), // first star-ID on clicked item when overlapping
          top: event.clientY,
          left: event.clientX,//offset().left,paragraph.offset().left + paragraph.width() + 20,
        });
      else
        maze.domino.controller.update('active_selection',{
          content: '',
          id: paragraph.attr('id'),
          top: event.clientY,
          left: event.clientX,//offset().left,paragraph.offset().left,
          width: 20,
          column: maze.DOC
        });

    }


    _startup.toggle_preview = function( event ){
      event.preventDefault();
      event.stopImmediatePropagation();
      if (maze.domino.controller.get('ui_lock'))
        return false;


      var doc = $(event.currentTarget).closest('.document'),
          references = doc.attr('data-ref-ids').trim().split(' ');

      if( references.length ){
        _self.dispatchEvent('fill_references',{ref_ids:references});
      }
      maze.move.toggle_preview( doc );
    };

    _startup.set_leader = function( event ){
      event.preventDefault();
      event.stopImmediatePropagation();
      if (maze.domino.controller.get('ui_lock'))
        return false;

      var doc = $(event.currentTarget).closest('.document').removeClass('match'),
          id = doc.attr('data-id') || doc.attr('id');

      _self.dispatchEvent('scene_update',
        {
          scene_action:maze.ACTION_SET_DOC_LEADER,
          scene_column:{
            leading:maze.DOC,
            slave:maze.TEXT
          },
          scene_item:{
            id:'#' + id,
            column: maze.DOC
          }
        }
      );
    };


    _slave_opened.toggle_preview = function( event ){
      event.preventDefault();
      event.stopImmediatePropagation();
      if (maze.domino.controller.get('ui_lock'))
        return false;

      var doc = $(event.currentTarget).closest(".document");
      
      maze.move.toggle_preview( doc, {
        callback: function(doc){
          if(!doc.hasClass('preview') && doc.attr('data-enable-slider'))
            _self.dispatchEvent('slider_leave_target', {id: doc.attr('id')});
        },
        args: [doc]
      });
    };
    

    _search.set_leader = function( event ){
      event.preventDefault();
      event.stopImmediatePropagation();
      if (maze.domino.controller.get('ui_lock'))
        return false;

      var target = $(event.currentTarget),
          doc = target.closest('.document'),
          id = doc.attr('data-id') || doc.attr('id'),
          slide = target.attr('data-slide-index');

      _self.dispatchEvent('scene_update',
        {
          scene_action:maze.ACTION_SET_DOC_LEADER,
          scene_column:{
            leading:maze.DOC,
            slave:maze.TEXT
          },
          scene_slide:( typeof slide == "undefined"? '0': slide ),
          scene_item:{
            id:'#' + id,
            column: maze.DOC
          }
        }
      );
    };


    _slave_opened.readMore = function(e) {
      e.preventDefault();
      e.stopImmediatePropagation();
      if (maze.domino.controller.get('ui_lock'))
        return false;

      var doc = $(e.currentTarget).closest('.document');
      _self.bulkClose({
        namespace: 'doc',
        selectors: [ '#' + doc.attr('id') ],
        callback: maze.move.open,
        args: [
          doc,
          {
            callback: maze.move.inject,
            args: [
              doc,
              {
                callback: function() {
                  _self.dispatchEvent( 'slider_init', {
                    selector: '#' + doc.attr('id'),
                    slide: 0,
                    type: 'document'
                  });
                  _self.dispatchEvent('execute_slider_to', {
                    selector: '#' + doc.attr('id'),
                    index: doc.find('.slides-wrapper').attr('data-current-index') || 0
                  });
                }
              }
            ]
          }
        ]
      });
    };


    _slave_opened.readLess = function(e) {
      var item = $(e.currentTarget).closest(".item");
      _self.dispatchEvent('slider_leave_target', {id: item.attr('id')});
      maze.move.scrollto(item,{});
      maze.move.close(item, {});
    };


    _search.toggle_preview = function( event ){
      event.preventDefault();
      event.stopImmediatePropagation();
      if (maze.domino.controller.get('ui_lock'))
        return false;

      var doc = $(event.currentTarget).closest(".document");
      maze.move.toggle_collapsed( doc );
    }

    _closed.open = function( event ){
      event.preventDefault();
      event.stopImmediatePropagation();
      if (maze.domino.controller.get('ui_lock'))
        return false;

      var doc = $(event.currentTarget),
          scene_column = maze.domino.controller.get('scene_column');

      maze.domino.controller.update('scene_column',{
        leading:scene_column.leading,
        slave:maze.DOC
      });

      _self.dispatchEvent('columnify',{
        callback: maze.move.show,
        args:[ doc, {
          callback: maze.move.scrollto,
          args:[ doc ]
        }]
      });

    };


   _sticky.toggle_preview = function( event ){
      event.preventDefault();
      event.stopImmediatePropagation();
      if (maze.domino.controller.get('ui_lock'))
        return false;
      var action = maze.domino.controller.get('scene_action'),
          doc = $( '#' + $(event.currentTarget).closest(".document").attr('data-id') );
          
      if( action == maze.ACTION_NOTEBOOK || action == maze.ACTION_SEARCH )
        maze.move.show_collapsed( doc,{
          callback: maze.move.scrollto,
          args:[ doc ]
        });
      else
        maze.move.show( doc,{
          callback: maze.move.scrollto,
          args:[ doc ]
        });
    }



    // _self.read_more = function(e) { console.log('%cread_more for DOCUMENT, locally ovverridden', 'background-color: cyan');
    //   e.preventDefault();
    //   e.stopImmediatePropagation();
    //   if (maze.domino.controller.get('ui_lock'))
    //     return false;

    //   var item = $(e.currentTarget).closest(".document");

    //   _self.bulkClose({
    //     namespace: 'doc',
    //     selectors: ['#' + item.attr('id')],
    //     callback: maze.move.open,
    //     args: [
    //       item, {
    //         callback: maze.move.inject,
    //         args: [item, {
    //           callback: maze.move.scrollto,
    //           args: [item]
    //         }]
    //       }
    //     ]});

    // };
    /*

      Inintialize Listeners
      ---

    */
    
    
    /*maze.on("click", "#column-voc .static-sticky .toggle-preview", _self.sticky_preview);
    maze.on("click", "#column-voc .static-sticky .action.set-leader", _startup.set_leader);

    maze.on("click", "#column-voc .term .toggle-preview",  _self.toggle_preview );
    maze.on("click", "#column-voc .term .action.set-leader",  _self.set_leader );
    maze.on("click", "#column-voc .term .read-more",  _self.read_more );
    
    maze.on("click", "#column-voc.leader .link",  _self.link);
    */

    maze.on("click", "#column-doc .static-sticky .toggle-preview", this.sticky_preview);
    maze.on("click", "#column-doc .static-sticky .action .set-leader", _startup.set_leader);

    maze.on("click", "#column-doc.slave_opened .document .set-leader",_startup.set_leader );
    maze.on("click", "#column-doc.slave_opened .document .read-more", _slave_opened.readMore );
    maze.on("click", "#column-doc.slave_opened .document .read-less",  _slave_opened.readLess );
    // maze.on("click", "#column-doc .document .read-more",  _self.read_more);

    maze.on("click", "#column-doc.leader .link",  _self.link );
    maze.on("mouseup", "#column-doc.leader .unselectable", _leader.toggle_star );

    maze.on("click", "#column-doc.startup .document .toggle-preview", _startup.toggle_preview );
    maze.on("click", "#column-doc.startup .document .set-leader", _startup.set_leader );

    maze.on("click", "#column-doc.slave_opened .document .toggle-preview", _slave_opened.toggle_preview );
    

    maze.on("click", "#column-doc.search .document .toggle-preview",  _search.toggle_preview );
    maze.on("click", "#column-doc.search .document .set-leader",  _startup.set_leader );
    maze.on("click", "#column-doc.search .document .paragraph",  _search.set_leader );

    maze.on("click", "#column-doc.notebook .document .toggle-preview",  _search.toggle_preview );
    maze.on("click", "#column-doc.notebook .document .set-leader",  _startup.set_leader );
    
    maze.on("click", "#column-doc.notebook .document .paragraph",  _search.set_leader );

    //maze.on("click", "#column-doc.notebook .document .paragraph",  _search.set_leader );

    maze.on("click", "#column-doc.closed .document", _closed.open );







    /*

      Slider part
      ---

      It allows to browse slides
    */

    var _handlers = {};

    this.triggers.events.doc_move_to = function( controller, event){
      moveto( event.data.index, $(event.data.doc) );
    };

    var moveto = function( index, doc ){

      var box =  doc.find(".slides-box"),
          wrapper = doc.find(".slides-wrapper"),
          slide_height = doc.find('.slide[data-index='+index+']').height(),
          cursor = doc.find(".cursor"),
          size = +doc.attr('data-size'),
          nav = $("#static-document-nav");

      // if( box.attr('data-status') )
      box.height( slide_height );

      if( index <= 0 ){
        index = 0;
        nav.find(".arrow.left").fadeOut();
        nav.find(".arrow.right").fadeIn();

      } else if( index >= size -1 ){
        index = size-1;
        nav.find(".arrow.left").fadeIn();
        nav.find(".arrow.right").fadeOut();

      } else {
        doc.find(".arrow").fadeIn();
      }

      wrapper.animate({
        left: ( -index * 100 ) + '%'
      },{
        easing: maze.move.easing,
        duration:500,
        queue:false
      });

      cursor.animate({
        left: (index * 100/size) + '%'
      },{
        easing: maze.move.easing,
        duration:500,
        queue:false
      })

      doc.attr('data-cursor', index)


    }

    _handlers.goto_slide = function( event ){

      var placeholder = $(event.currentTarget),
        doc = placeholder.closest(".document");

      moveto( +placeholder.attr('data-index'), doc);

    }

    _handlers.previous_slide = function( event ){
      var doc = $(event.currentTarget).closest(".document"),
          cursor = +doc.attr('data-cursor');

      moveto( cursor - 1, doc );
    }

    _handlers.next_slide = function( event ){
      var doc = $(event.currentTarget).closest(".document"),
          cursor = +doc.attr('data-cursor');

      moveto( cursor + 1, doc );
    }

    maze.on("click", "#column-doc .document .arrow.left", _handlers.previous_slide );
    maze.on("click", "#column-doc .document .arrow.right", _handlers.next_slide  );
    maze.on("click", "#column-doc .document .placeholder", _handlers.goto_slide  );
  };



})();
