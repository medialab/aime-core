;(function() {
  'use strict';

  mlab.pkg('maze.domino.modules');
  maze.domino.modules.ColumnVoc = function(controller) {
    maze.domino.modules.Column.call(this, $('#column-voc .box'));

    var _self = this,
      _startup = {},
      _leader = {},
      _slave_opened = {},
      _search = {},
      _closed = {},
      _sticky = {},
      _freeze;

    this.sticky = $("#static-term .term");
    this.sticky_title = $("#static-term-title");
    this.sticky_height = 0;

    this.triggers.events.sticky_term_update = function(controller, e) {
      _self.sticky_update(e.data);
    };

    this.triggers.events.sticky_term_adjust = function(controller, e) {
      _self.sticky_adjust(e.data);
    };

    _self.unsticky = function(){
      _self.sticky_adjust({ offset:-1000});
    }

    this.triggers.events.scrolling_voc = function( controller, event ) {
      _self.scrolling( controller,{
        sticky_type:'term', // [term|document]
        prefix: 'vocab-', // id prefix for the given stuff
        namespace: 'voc'
      });
    };

    this.triggers.events.setup_voc_as_leader = function( controller, event ){
        var scene_item = controller.get('scene_item'),
            glossary = controller.get('scene_glossary').map( function(i){ return '#vocab-'+i; } );

        _self.box.unhighlight({ element: 'span', className: 'highlight' });
        _self.box.find(".match").removeClass("match"); // Remove previous match classes

        //$(".term.leader").removeClass("leader");
        $(".term.glossary").removeClass("glossary");


        
        maze.log(glossary.length);
        for(var i=0; i < glossary.length; i++) {
          var options = {};

          if(i == glossary.length - 2){

            options = {
              callback: maze.move.scrollto,
              args:[ scene_item.id, {}]
            };

          }

          if( scene_item.id != glossary[i] )
            maze.move.close_and_hide( $( glossary[i] ).addClass("glossary"), options );
        }


    };

    this.triggers.events.data_voc_updated = function(controller) {
      var col = controller.get('scene_column');
      _self.listof( controller, {
        selector: '.term',
        prefix: '#vocab-',
        namespace:'voc',
        template: maze.engine.template.term,
        afterComplete: (
          (col.leading === maze.COMM) &&
          (col.slave === maze.VOC)
        ) ? function() {
          // Toggle preview!
          if (_self.box.find('.term').length)
            _self.box.find('.term .toggle-preview').click();
        } : undefined
      });
    };

    /*

      Mouse handling functions
      ===

    */
    _startup.set_leader = function( event ){
      event.preventDefault();
      event.stopImmediatePropagation();
      if (maze.domino.controller.get('ui_lock'))
        return false;

      var term = $(event.currentTarget).closest(".term"),
          id = term.attr('data-id') || term.attr('id');

      _self.dispatchEvent('scene_update',
        {
          scene_action:maze.ACTION_SET_VOC_LEADER,
          scene_column:{
            leading:maze.VOC,
            slave:maze.TEXT
          },
          scene_item:{
            id:'#' + id,
            column: maze.VOC
          }
        }
      );
    };

    _leader.set_leader = _startup.set_leader;


    _leader.toggle_preview = function(e) {
      e.preventDefault();
      e.stopImmediatePropagation();
      if (maze.domino.controller.get('ui_lock'))
        return false;

      var item = $(e.currentTarget).closest(".item"),
          item_id = item.attr('data-id') || item.attr('id');

      // maze.log('>>>   _leader.toggle_preview', item_id, );
      if(!item.hasClass('opened')) {

        maze.move.open('#' + item_id, {
          callback:  maze.move.scrollto,
          args:['#' + item_id]
        });
      } else {
        maze.move.close('#' + item_id, {callback: function(){
          item.removeClass('opened');
        }});
      }
    };


    _leader.interlink = function(e) {
      e.preventDefault();
      e.stopImmediatePropagation();
      if (maze.domino.controller.get('ui_lock'))
        return false;
      var link = $(e.currentTarget),
          item_id = link.attr('data-id');

      maze.move.open('#' + item_id, {
        callback:  maze.move.scrollto,
        args:['#' + item_id]
      });
    };


    _closed.open = function( event ){
      event.preventDefault();
      event.stopImmediatePropagation();

      if (maze.domino.controller.get('ui_lock'))
        return false;

      var term = $(event.currentTarget),
          scene_column = maze.domino.controller.get('scene_column');

      maze.domino.controller.update('scene_column',{
        leading:scene_column.leading,
        slave:maze.VOC
      });

      // (Ask Daniele about that)
      // TODO: It is supposed to just HIDE the contribution... Let's do that.
      // _self.dispatchEvent('delete_contribution');
      //
      // Is that good enough?
      // - nope, when comm is in leading
      if( scene_column.leading != maze.COMM )
        _self.dispatchEvent('notebook_discard');

      _self.dispatchEvent('columnify',{
        callback: maze.move.show,
        args:[ term, {
          callback: maze.move.scrollto,
          args:[ term ]
        }]
      });

    };

    
    this.set_leader = function(event){
      event.preventDefault();
      event.stopImmediatePropagation();
      if (maze.domino.controller.get('ui_lock'))
        return false;

      var term = $(event.currentTarget).closest(".term");

      _self.dispatchEvent('scene_update',
        {
          scene_action:maze.ACTION_SET_VOC_LEADER,
          scene_column:{
            leading:maze.VOC,
            slave:maze.TEXT
          },
          scene_item:{
            id:'#' + term.attr('id'),
            column: maze.VOC
          }
        }
      );
    };


    

    /*

      Inintialize Listeners
      ---

    */
    maze.on("click", "#column-voc.leader .static-sticky .toggle-preview", _leader.toggle_preview);
    maze.on("click", "#column-voc .static-sticky .toggle-preview", _self.sticky_preview);
    maze.on("click", "#column-voc .static-sticky .action .set-leader", _startup.set_leader);

    maze.on("click", "#column-voc.leader .term .toggle-preview",  _leader.toggle_preview);

    maze.on("click", "#column-voc .term .toggle-preview",  _self.toggle_preview );
    maze.on("click", "#column-voc .term .action .set-leader",  _self.set_leader );
    maze.on("click", "#column-voc .term .read-more",  _self.read_more );
    maze.on("click", "#column-voc .term .read-less",  _self.read_less );

    maze.on("click", "#column-voc.leader .link.vocab",  _leader.interlink);
    maze.on("click", "#column-voc.leader .link",  _self.link);

    // maze.on("click", "#column-voc.startup .term .action.set-leader",  _startup.set_leader );
    // maze.on("click", "#column-voc.startup .term .read-more",  _startup.read_more );

    // maze.on("click", "#column-voc.leader .term .action.set-leader",  _leader.set_leader );
    // maze.on("click", "#column-voc.leader .term .read-more",  _leader.read_more );
    // maze.on("click", "#column-voc.leader .link",  _self.link );

    // maze.on("click", "#column-voc.slave_opened .term .read-more",  _slave_opened.read_more );

    // maze.on("click", "#column-voc.search .term .action.set-leader",  _search.set_leader );
    // maze.on("click", "#column-voc.search .term .read-more",  _search.read_more );
    // maze.on("click", "#column-voc.search .term .paragraph",  _search.set_leader );

    // maze.on("click", "#column-voc.notebook .term .action.set-leader",  _search.set_leader );
    // maze.on("click", "#column-voc.notebook .term .read-more",  _search.read_more );
    // maze.on("click", "#column-voc.notebook .term .paragraph",  _search.set_leader );

    maze.on("click", "#column-voc.closed .term",  _closed.open );

    this.box.on('scroll', function() {
      //console.log('asidpoaipoasidpoaidspad');
      _self.scrolling(maze.domino.controller,{
          sticky_type:'term', // [term|document]
          prefix: 'vocab-', // id prefix for the given stuff
          namespace: 'voc'
      });
      //_self.dispatchEvent('scrolling_voc',{ action: controller.get('scene_action') });
      _self.toggle_shadow();
    });

  };
})();
