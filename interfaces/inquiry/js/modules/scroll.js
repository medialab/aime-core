;(function(undefined) {
  'use strict'

  mlab.pkg('maze.domino.modules');
  maze.domino.modules.Scroll = function() {
    domino.module.call(this);

    var _self = this;

    this.leading = {};
    this.slave = {};
    this.startup = {};
    this.search = {};

    $('.column .box').scroll(function(event){

      var classes = event.currentTarget.parentNode.className;
      var column_name = event.currentTarget.parentNode.id.slice( 7 ); // column name

      if( classes.length == 0 ){
        classes = event.currentTarget.parentNode.parentNode.className;
        column_name = event.currentTarget.parentNode.parentNode.id.slice( 7 );
      }


      // _self.log( classes, column_name)
      /*
      if( classes.indexOf("freeze")!= -1 ) return;
      if( classes.indexOf("leader")!= -1 ) return maze.controllers.scroll.leading[ column_name ]( event )
      if( classes.indexOf("slave_opened")!= -1 ) return maze.controllers.scroll.slave_opened[ column_name ]( event )
      if( classes.indexOf("startup")!= -1 ) return maze.controllers.scroll.startup[ column_name ]( event )
      if( classes.indexOf("search")!= -1 ) return maze.controllers.scroll.search[ column_name ]( event )
      */
    } );



  };
})();
