;(function() {
  'use strict';

  mlab.pkg('maze.domino.modules');
  maze.domino.modules.Search = function() {
    domino.module.call(this);

    var _self = this,
        _input = $('#search-query'); // the html box element

    this.search = function( query ){
      _self.dispatchEvent('scene_update', {
        scene_query: query, scene_action:maze.ACTION_SEARCH
      });
    }

    this.triggers.events.session__initialized = function(controller) {
      _input = $('#search-query');
      _input.on('keypress', function( event ){
        var query = _input.val().trim();
        if( query.length > 2 && event.keyCode==13)
          _self.search( query );
        else if (event.keyCode==13) maze.toast( maze.i18n.translate('Must be at least 3 characters') , {stayTime:3000, cleanup: true});

      });

      // _input.on('change', function( event ){
      //   var query = _input.val().trim();
      //   if( query.length > 2 )
      //     _self.search( query );
      // });

      $('#search-button').on('click', function(event){
        var query = _input.val().trim();
        if( query.length > 2 )
          _self.search( query );
        else if (event.keyCode==13) maze.toast( maze.i18n.translate('Must be at least 3 characters') , {stayTime:3000, cleanup: true});

      }); // the html box element

      _self.log('Search', '@session__initialized');
    };

    this.triggers.events.scene_query_updated = function(controller) {
      var newQuery = controller.get('scene_query');
      if (newQuery !== _input.val().trim())
        _input.val(newQuery);
    }
  };
})();
