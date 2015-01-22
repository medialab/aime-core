;(function(undefined) {
  'use strict'

  mlab.pkg('maze.domino.modules');

  /*
    Rangy library wrapper
    ---

    Handle text selection and dispatch maze.domino events
  */
  maze.domino.modules.Rangy = function() {
    domino.module.call(this);

    var _self = this,
        _highlighter = rangy.createHighlighter(),
        _previous_highlight = null;

    rangy.init();

    _highlighter.addClassApplier(rangy.createCssClassApplier('selection', {
      ignoreWhiteSpace: true,
      tagNames: ['span', 'a']
    }));

    this.triggers.events.ui_lock_selection_updated = function( controller ){

    }

    this.triggers.events.notebook_discard =
      this.triggers.events.open_editor = function( controller ){
        try {
          _highlighter.removeAllHighlights();
        } catch(e){ }
      };

    this.triggers.events.active_selection_updated = function( controller ){

      var selection = controller.get( 'active_selection' ),
          paragraph,
          selection,
          bounds = {};



      if( selection.id && [maze.TEXT, maze.VOC, maze.DOC].indexOf( selection.column )!=-1){
        // window.getSelection().empty();
        //paragraph = $('#' + selection.id );

        bounds.top = selection.top; // tooltip height / 2
        bounds.left =  selection.left + selection.width// paragraph.offset().left + paragraph[0].offsetWidth - 25;


        _self.dispatchEvent('notebook_choose',{
          type:maze.TYPE_NOTEBOOK_STAR,
          top: bounds.top,
          left: bounds.left
        });
      } else {
        _self.dispatchEvent('notebook_discard');
      }
    };






    maze.on( 'mouseup', function( event ){

      if( maze.domino.controller.get('ui_lock') )
        return

      var action = maze.domino.controller.get('scene_action'),
          selection = window.getSelection(),
          range,
          content,
          paragraph,
          paragraph_id,
          column = false;


      try {
        range = selection.getRangeAt(0);
      } catch(e) { /* Nothing to do here... */

        return
      }
      if( range.collapsed )
        return

      if( [ maze.ACTION_SET_TEXT_LEADER, maze.ACTION_SET_VOC_LEADER, maze.ACTION_SET_DOC_LEADER ].indexOf( action ) == -1 ){
        return
      }


      if (range){
        paragraph = $( range.startContainer ).closest( '.paragraph' ) ||
                      $( range.endContainer ).closest( '.paragraph' );
        _self.log( 'selection on range', range, paragraph);

        if( paragraph.length ){
          paragraph_id = paragraph.attr( 'id' );
          column = paragraph.closest( '.column' ).attr( 'data-column' );
          if( action != maze['ACTION_SET_' + column + '_LEADER'] )
            column = false;
        }
      }

      if ( column && paragraph_id ){
        _highlighter.removeAllHighlights();



        _highlighter.highlightSelection( 'selection', null, paragraph_id );

        content = selection.toString();

        if( content.length )
          maze.domino.controller.update( 'active_selection',{
            id:paragraph_id,
            column: column,
            content: content,
            top: event.clientY,
            left: event.clientX - paragraph.width(),//offset().left,
            width: paragraph.width() + 20
          });

        else
          maze.domino.controller.update( 'active_selection',{});



      } else {
        // console.log('%cyou have selected in the wrong place...', color)
        _highlighter.removeAllHighlights();
        selection.removeAllRanges();
      }
    });


  };


})();
