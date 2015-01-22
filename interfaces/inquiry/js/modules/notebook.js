;(function(undefined) {
  'use strict'

  mlab.pkg('maze.domino.modules');

  /*
    Rangy library wrapper
    ---

    Handle text selection and dispatch maze.domino events
  */
  maze.domino.modules.Notebook = function() {
    domino.module.call(this);

    var _self = this,
        is_busy = false,
        is_editing = false,
        tooltip = $("#bookTooltip"),
        contribution = { id:0 }; // contribution ID

    this.triggers.events.refill_paragraph = function(controller, event ){
      var luggage = $(".menu .world >div");

      luggage.removeClass('animated shake');
      clearTimeout( maze.timers.notebook_refill_paragraph );
      maze.timers.notebook_refill_paragraph = setTimeout( function(){
        luggage.addClass('animated shake');
      }, 100)


    }

    /*
      Show tooltip according to desired type

      @param event.data.type  - could be maze.TYPE_NOTEBOOK_STAR | maze.TYPE_NOTEBOOK_ADD | maze.TYPE_NOTEBOOK_DELETE | maze.TYPE_NOTEBOOK_EDIT
      @param event.data.top   - float
      @param event.data.left  - float

    */
    this.triggers.events.notebook_choose = function( controller, event){
      var p = $.extend({
        type: maze.TYPE_NOTEBOOK_STAR,
        top: 0,
        left: 0,
        id: 0
      }, event.data );

      tooltip.attr('data-type', p.type);

      if (p.id)
        tooltip.attr('data-contrib-id', p.id);
      else
        tooltip.attr('data-contrib-id', null);

      // secured means deletion forbidden
      tooltip.addClass('opened').removeClass('secured');

      tooltip.css({
        top: p.top,// - tooltip[0].offsetHeight/2 - 30,
        left: p.left// + tooltip[0].offsetWidth/2
      });
      is_busy = true;

      var contrib = maze.domino.controller.get('data_contContents')[p.id];

      switch( p.type ){
        case maze.TYPE_NOTEBOOK_EDIT:
          tooltip.find(".save").hide();

          if(contrib && contrib.status>0) { // if the contrib is submitted OR public, disable deletion
            tooltip.addClass("secured");
          }
          tooltip.find(".remove").show();
          break;
        default:
          tooltip.find(".save").show();
          tooltip.find(".remove").hide();
          break;
      }

      contribution.id = p.id;

    }

    /*
      UNDO notebook: close tooltip.
      Note: the same event will be triggered by editor Module and Rangy module.
    */
    this.triggers.events.notebook_discard =
      this.triggers.events.open_editor = function( controller ){
        contribution.id = 0;
        is_busy = false;
        tooltip.removeClass('opened');
      };


    maze.on( 'mouseup', '#bookTooltip', function( event ){ event.stopImmediatePropagation(); });

    maze.on( 'mouseup', 'body', function( event ){
      var is_editing = maze.domino.controller.get('is_editing');
      if( !is_editing && is_busy )
        _self.dispatchEvent('notebook_discard');
    });

    maze.on( 'click', '#bookTooltip', function( event ){
      event.stopImmediatePropagation();
      tooltip.toggleClass('on');
    });

    /*
      Save a bookmark without title or objection
    */
    maze.on( 'click', '#bookTooltip .save', function( event ){
      event.stopImmediatePropagation();
      _self.dispatchEvent('save_bookmark');
      maze.toast( maze.i18n.lang == 'fr' ? 'sauvegardé dans le notebook' : 'saved into the notebook' );
    });

    /*
      Remove a bookmark OR a contribution. A contribution.id must be send to delete_contribution.
    */
    maze.on( 'click', '#bookTooltip .remove', function( event ){
      event.stopImmediatePropagation();
      if (confirm(maze.i18n.translate('are you sure you want to delete this contribution?')))
        _self.dispatchEvent('delete_contribution', {
          id: contribution.id,
          column: maze.domino.controller.get('scene_column').leading
        });
    });

    maze.on( 'click', '#bookTooltip .contribute', function( event ){
      event.stopImmediatePropagation();

      _self.log('click on contribution object:', contribution);

      // Check if the bookmark exists or if it is created:
      if (tooltip.attr('data-type') === maze.TYPE_NOTEBOOK_EDIT)
        _self.dispatchEvent('edit_contribution', {
          id: contribution.id,
          scene_column: {
            slave: maze.COMM
          }
        });
      else
        _self.dispatchEvent('save_bookmark', {
          editor_init: true
        });
    });
  };
})();
