// The overall login/signup procedure
(function() {
  'use strict';

  mlab.pkg('maze.domino.modules');
  maze.domino.modules.Login = function() {
    domino.module.call(this);

    var _self = this;

    var box = $('#login');

    /*
      [authenticate] events handling
    */
    box.on('click', '[data-action=authenticate]', function(e) {
      console.log('launching procedure');
      _self.dispatchEvent('auth_require');
    });
  };
})();