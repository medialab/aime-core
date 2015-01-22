;(function() {
  'use strict';

  mlab.pkg('maze.domino.modules');
  maze.domino.modules.ColumnComm = function(controller) {
    maze.domino.modules.Column.call(this, $('#column-comm .box'));

    var _self = this,
        _startup = {},
        _leader = {},
        _slave_opened = {},
        _notebook = {},
        _search = {},
        _closed = {},
        _sticky = {};

    this.sticky = $("#static-contribution .contribution");
    this.sticky_title = $("#static-contribution-title");
    this.sticky_height = 0;

    this.sticky_update = function(data) {
      if( maze.domino.controller.get('is_editing') === true )
        return;

      _self.sticky_title.html( data.title );
      _self.sticky
        .attr('class', data.classes)
        .attr('data-id', data.id)
        .attr('data-private-status', data.private_status);
      _self.sticky_height = _self.sticky.height();
    };

    this.sticky_adjust = function(data) {
      if( controller.get('is_editing') === true )
        return
      //maze.log('sticky_adjust', data);
      var p = {};

      if( typeof data.offset != "undefined" )
        p['top'] = data.offset;

      if( typeof data.shadow != "undefined" )
        p['padding-bottom'] = Math.min(10, data.shadow);

      _self.sticky.css(p);
    };

    this.triggers.events.sticky_contribution_update = function( controller, e ){
      _self.sticky_update(e.data);
    }

    this.triggers.events.sticky_contribution_adjust = function( controller, e ){ //maze.log(e.data)
      _self.sticky_adjust(e.data);
    };

    this.triggers.events.is_editing_updated = function(controller, e){
      var is_editing = controller.get('is_editing');
      if(is_editing)
        _self.sticky.css({
          top: -1000
        });
    };

    _self.unsticky = function(){
      _self.sticky_adjust({
        offset:-1000
      });
    };

    this.triggers.events.scrolling_cont = function( controller, event ) {
      _self.scrolling( controller,{
        sticky_type:'contribution', // [term|document]
        prefix: 'cont-', // id prefix for the given stuff
        namespace: 'cont'
      })
    };

    this.box.on('scroll', function() {
      _self.scrolling(maze.domino.controller, {
        sticky_type:'contribution', // [term|document]
        prefix: 'cont-', // id prefix for the given stuff
        namespace: 'cont'
      })
      _self.toggle_shadow();
    });

    this.triggers.events.data_cont_updated = function(controller) {
      _self.listof( controller, {
        selector: '.contribution',
        prefix: '#cont-',
        namespace:'cont',
        is_editing: controller.get('is_editing'),
        template: maze.engine.template.contribution
      });
    };

    this.triggers.events.build_references = function(controller, event ) {
      for( var i in event.data.references ){
        var obj = event.data.references[i];
        $("[data-ref=ref-"+obj.rec_id+"]").html( obj.mla );
      }
    }

    _startup.toggle_preview =
    _slave_opened.toggle_preview = function( event ){
      event.preventDefault();
      event.stopImmediatePropagation();
      if (maze.domino.controller.get('ui_lock'))
        return false;

      var item = $(event.currentTarget).closest(".contribution");

      maze.move.toggle_preview( item, {
        callback: function(item){
          if(!item.hasClass('preview') && item.attr('data-enable-slider'))
            _self.dispatchEvent('slider_leave_target', {id: item.attr('id')});
        },
        args: [item]
      });
    };



    _startup.set_leader = function( event ){
      event.preventDefault();
      event.stopImmediatePropagation();
      if (maze.domino.controller.get('ui_lock'))
        return false;

      var item = $(event.currentTarget).closest('.contribution'),
          id = item.attr('data-id') || item.attr('id');

      _self.dispatchEvent('scene_update',
        {
          scene_action:maze.ACTION_SET_COMM_LEADER,
          scene_column:{
            leading:maze.COMM,
            slave:maze.TEXT
          },
          scene_item:{
            id:'#' + id,
            column: maze.COMM
          }
        }
      );
    };

    _slave_opened.readMore = function(e) {
      e.preventDefault();
      e.stopImmediatePropagation();
      if (maze.domino.controller.get('ui_lock'))
        return false;

      maze.move.open(
        $(e.currentTarget).closest('.contribution')
      );
    };

    _slave_opened.readLess = function(e) {
      var item = $(e.currentTarget).closest(".item");
      _self.dispatchEvent('slider_leave_target', {id: item.attr('id')});
      maze.move.scrollto(item,{});
      maze.move.close(item, {});
    };




    _closed.open = function( event ){
      event.preventDefault();
      event.stopImmediatePropagation();
      if (maze.domino.controller.get('ui_lock'))
        return false;

      var comm = $(event.currentTarget),
          scene_column = maze.domino.controller.get('scene_column');

      maze.domino.controller.update('scene_column',{
        leading:scene_column.leading,
        slave:maze.COMM
      });

      _self.dispatchEvent('columnify',{
        callback: maze.move.com.show,
        args:[ comm, {
          callback: maze.move.com.scrollto,
          args:[ comm ]
        }]
      });

    };


    _sticky.toggle_preview = function( event ){
      event.preventDefault();
      event.stopImmediatePropagation();

      if (maze.domino.controller.get('ui_lock'))
        return false;


      var action = maze.domino.controller.get('scene_action'),
          item = $( '#' + $(event.currentTarget).closest(".contribution").attr('data-id') );

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
    }


    /*
      On click / tap enslighten related item in other columns
    */
    var current_selected_contribution = { // this should be moved to domino? performance issues.
      contribution: [],
      column: [],
      column_name: false
    };


    _notebook.toggle_preview = function(event) {
      event.preventDefault();
      event.stopImmediatePropagation();

      if (maze.domino.controller.get('ui_lock'))
        return false;

      var contribution = $(event.currentTarget).closest('.contribution'),
          id = (contribution.attr('data-id') || contribution.attr('id')).replace(/[^\d]/g,''),
          item, 
          link,
          column,
          column_name;

      if(current_selected_contribution.id == id) { // unselect current selected contribution, and collapse. stops here
        current_selected_contribution.id = false;
        return;
      } 
      //_self.toggle_preview(event);
      if(contribution.attr('data-inlinks')) {
        item = $('#' + contribution.attr('data-inlinks').split(' ').shift());
        link = $('.link[data-id*=star-' + id + ']', item).first();
        column = item.closest('.column');
      } else {
        link = $('.link[data-id*=star-' + id + ']');
        column = link.closest('.column');
        item = column_name == maze.VOC || column_name == maze.DOC? link.closest('.item'): link.closest('.paragraph');
      }

      column_name = column.attr('data-column');
      // remove previously selected annotation
      if(current_selected_contribution.column_name && current_selected_contribution.column_name != column_name) {
        current_selected_contribution.column.removeClass('enlighten');
      }

      if(current_selected_contribution.column_name &&  contribution.attr('id') != current_selected_contribution.id) {
        current_selected_contribution.contribution.removeClass('selected');
      }

      column.addClass('enlighten');
      contribution.addClass('selected');
      current_selected_contribution.column = column;
      current_selected_contribution.column_name = column_name;
      current_selected_contribution.contribution = contribution;
      current_selected_contribution.id = contribution.attr('id');

      if(link.length){
        if(column_name == maze.VOC || column_name == maze.DOC) {
          if (item.hasClass('collapsed'))
            maze.move.show_collapsed(item, {
              callback: maze.move.scrollto,
              args:[ item, {
                offset: -25,
                target: link//.position().top
              }]
            });
          else
            maze.move.scrollto(item, {
              offset: link.position().top -25
            });
        } else if(column_name == maze.TEXT) {
          if (item.hasClass('collapsed')) {
            var subheading = item.closest('.subtitle');

            maze.move.show_collapsed(subheading, {
              callback: maze.move.text.subheading.scrollto,
              args:[ subheading, {
                offset: -25,
                target: link//.position().top
              }]
            });
          } else {
            maze.move.text.subheading.scrollto(item.closest('.subtitle'), {
              offset: link.position().top - 25 // one line more or less
            });
          }
        }
      }
    }
    /*

      Inintialize Listeners
      ---

    */
    

    maze.on("mouseenter", "#column-comm.notebook .xxxxxxcontribution",function(event) {
      event.preventDefault();
      event.stopImmediatePropagation();

      if (maze.domino.controller.get('ui_lock'))
        return false;

      var link = $(event.currentTarget),
          target = $('.link[data-id*=star-' + link.attr('data-int-id') + ']'),
          item,
          column,
          column_name;

      if(target.length) {
        column = target.closest('.column').addClass('enlighten');
        column_name = column.attr('data-column');
        target.addClass('hover');

        if(column_name == maze.VOC) {
          item = target.closest('.term');
          maze.move.scrollto(item, {
            offset: target.first().position().top -25
          });
        } else if(column_name == maze.DOC) {
          item = target.closest('.document');
          maze.move.scrollto(item, {
            offset: target.first().position().top -25
          });
        } else {
          var paragraph = target.closest('.paragraph'),
              subheading = paragraph.closest('.subtitle');

          maze.move.text.subheading.scrollto(subheading,{
            offset: target.first().position().top - 25 // one line more or less
          });
        }
      }
    });

    maze.on("mouseleave", "#column-comm.notebook .xxxcontribution",function(event) {
      event.preventDefault();
      event.stopImmediatePropagation();
      var item = $(event.currentTarget),
          target = $('.link[data-id*=star-' + item.attr('data-int-id') + ']'),
          column = target.closest('.column');

      if(target.length) {
        column.removeClass('enlighten');
        target.removeClass('hover');
      }
    });

    maze.on("mouseenter", "#column-comm .contribution", _self.item_enter );
    maze.on("mouseleave", "#column-comm .contribution", _self.item_leave );

    maze.on("click", "#column-comm.notebook .static-sticky .contribution .toggle-preview",  _notebook.toggle_preview ); // sticky into notebook. Cfr. toggle_preview
    maze.on("click", "#column-comm .static-sticky .contribution .toggle-preview",  _self.sticky_preview);


    maze.on("click", "#column-comm.leader .contribution:not(.editor) .toggle-preview",  _startup.set_leader );

    maze.on("click", "#column-comm.startup .contribution .toggle-preview",  _startup.toggle_preview );
    maze.on("click", "#column-comm.startup .contribution .set-leader",  _startup.set_leader );

    maze.on("click", "#column-comm.slave_opened .contribution .toggle-preview", _slave_opened.toggle_preview );
    maze.on("click", "#column-comm.slave_opened .contribution .set-leader",   _startup.set_leader );
    maze.on("click", "#column-comm.slave_opened .contribution .read-more",  _self.read_more_with_slides);
    maze.on("click", "#column-comm.slave_opened .contribution .read-less",  _slave_opened.readLess );

    maze.on("click", "#column-comm.search .contribution .toggle-preview",  _startup.toggle_preview );
    maze.on("click", "#column-comm.search .contribution .set-leader",  _startup.set_leader );

    maze.on("click", "#column-comm.notebook .contribution .toggle-preview",  _notebook.toggle_preview );
    maze.on("click", "#column-comm.notebook .contribution .set-leader",  _startup.set_leader );
    //maze.on("click", "#column-comm.notebook .contribution .paragraph",  _startup.set_leader );

    maze.on("click", "#column-comm.closed .contribution",  _closed.open );

    maze.on("click", "#column-comm .contribution .edit",  function(event) {
      _self.dispatchEvent('edit_contribution', {
        id: $(event.target).closest('.contribution').attr('data-int-id')
      });
    });

   maze.on('click', '#column-comm .makepublic-contribution', function(event) {
      _self.dispatchEvent('makepublic_contribution', {
        id: $(event.target).closest('.contribution').attr('data-int-id'),
        callback: function(contribution) {
          var _contrib = contribution;

          window.setTimeout(function() {
            maze.toast( maze.i18n.translate('the contribution has been successfully made public'));
          }, 400);

          if ('status' in _contrib)
            $(event.target).closest('.contribution').attr('data-private-status', _contrib.status);
        }
      });
    });

    maze.on('click', '#column-comm .makemoderated-contribution', function(event) {
      _self.dispatchEvent('makemoderated_contribution', {
        id: $(event.target).closest('.contribution').attr('data-int-id'),
        callback: function(contribution) {
          var _contrib = contribution;

          window.setTimeout(function() {
            maze.toast( maze.i18n.translate('the contribution has been successfully made private'));
          }, 400);

          if ('status' in _contrib)
            $(event.target).closest('.contribution').attr('data-private-status', _contrib.status);
        }
      });
    });




    /*

      Slider part
      ---

      It allows to browse slides
    */

    var _handlers = {};

    var moveto = function( index, doc ){

      var wrapper = doc.find(".slides-wrapper"),
          cursor = doc.find(".cursor"),
          size = +doc.attr('data-size');

      if( index <= 0 ){
        index = 0;
        doc.find(".arrow.left").hide();
        doc.find(".arrow.right").show();

      } else if( index >= size -1 ){
        index = size-1;
        doc.find(".arrow.left").show();
        doc.find(".arrow.right").hide();
      } else {
        doc.find(".arrow").show();

      }

      wrapper.animate({
        left: ( -index * 100 ) + '%'
      },{
        easing: maze.move.doc.easing,
        duration:500,
        queue:false
      });

      cursor.animate({
        left: (index * 100/size) + '%'
      },{
        easing: maze.move.doc.easing,
        duration:500,
        queue:false
      })

      doc.attr('data-cursor', index)


    }

    _handlers.goto_slide = function( event ){

      var placeholder = $(event.currentTarget),
        doc = placeholder.closest(".contribution");

      moveto( +placeholder.attr('data-index'), doc);

    }

    _handlers.previous_slide = function( event ){
      var doc = $(event.currentTarget).closest(".contribution"),
          cursor = +doc.attr('data-cursor');

      moveto( cursor - 1, doc );
    }

    _handlers.next_slide = function( event ){
      var doc = $(event.currentTarget).closest(".contribution"),
          cursor = +doc.attr('data-cursor');

      moveto( cursor + 1, doc );
    }

    maze.on("click", "#column-comm .contribution .arrow.left",  _handlers.previous_slide  );
    maze.on("click", "#column-comm .contribution .arrow.right",  _handlers.next_slide  );
    maze.on("click", "#column-comm .contribution .placeholder",  _handlers.goto_slide  );

    /*
      Listener for pdf viewer plugin
    */
    $(window).on('pdfLoaded', function(event){
      _self.dispatchEvent('slider_to', {index:0});
    });

  };



})();
