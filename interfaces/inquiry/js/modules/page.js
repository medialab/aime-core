;(function() {
  'use strict';

  mlab.pkg('maze.domino.modules');
  maze.domino.modules.Page = function() {
    domino.module.call(this);

    var _self = this,
        _input = $('#page-number'); // the html box element


    this.browse = function( page_number ){
        _self.log( "browse", page_number, '.subtitle[data-page='+page_number+']', '.paragraph[data-page='+ page_number +']' );
        // TODO check directly inside the contents
        var subheading = $('.subtitle[data-page="'+page_number+'"]').first()

        if( subheading.length == 0 ) // +1
            subheading = $('.subtitle[data-page="' + (+page_number + 1)+'"]').first()

        if( subheading.length == 0 ) // -1
            subheading = $('.subtitle[data-page="' + (+page_number - 1)+'"]').first()

        if( subheading.length == 0 )
            subheading = $('.paragraph[data-page="'+ page_number +'"]').first().closest('.subtitle');

        _self.log( "browse to the closest page", subheading.attr('data-page') );

        // change current bookmark to fit the page, else put an error
        if( subheading.length ){
            var chapter = subheading.closest('.chapter'),
                scene_bookmark = {
                    chapter: '#' + chapter.attr( 'id' ),
                    subheading: '#' + subheading.attr( 'id' )
                }
            maze.log( "browse", page_number,  scene_bookmark);

            // We have to change scne if and only if scene_action is TEXT LEADER. Store otherwise and handle manually
            if( maze.domino.controller.get( 'scene_action' ) != maze.ACTION_SET_TEXT_LEADER ){
                _self.dispatchEvent('scene_update',{
                    scene_action: maze.ACTION_SET_TEXT_LEADER,
                    scene_column: {
                      leading: maze.TEXT,
                      slave: maze.VOC
                    },
                    scene_bookmark: scene_bookmark
                });
            } else{
                _self.dispatchEvent('scene_store',{
                    scene_bookmark: scene_bookmark
                }).dispatchEvent('text_scrollto');

            }

        } else {

            // TODO handle page not found error
            maze.toast( maze.i18n.translate('page not found') );
        }



    }

    /*_input.on('keypress', function( event ){ // override change function...

    	var page_number = _input.val().replace(/[^\d]/g,'');

    	if( page_number.length > 0 && event.keyCode==13){
            _self.browse( page_number );
        }

    });*/

    _input.on('change', function( event ){

    	var page_number = _input.val().replace(/[^\d]/g,'');
    	if( page_number.length > 0 ){
    		_self.browse( page_number );
    	}
    });

    this.triggers.events.scene_page_updated = function( controller ){
        if( controller.get('scene_action') == maze.ACTION_SET_TEXT_LEADER )
            _input.val( controller.get('scene_page') );
        else
            _input.val('');
        // _self.log('this.triggers.events.scene_page_updated ')
    }

  };
})();
