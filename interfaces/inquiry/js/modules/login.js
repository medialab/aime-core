// The overall login/signup procedure
(function() {
  'use strict';

  mlab.pkg('maze.domino.modules');
  maze.domino.modules.Login = function() {
    domino.module.call(this);

    var _self = this;

    $('#login').replaceWith(maze.engine.template.login());
    var box = $('#login');

    /*
      [authenticate] events handling
    */
    box.on('click', '[data-action=authenticate]', function(e) {
      console.log('launching procedure');
      _self.dispatchEvent('auth_require', {
        email: $('#email').val(),
        password: $('#password').val()
      });

    });

    /*
      listening on login requests
    */
    this.triggers.events.auth_open_login = function(controller) {
      console.log('there is a auth_required', box);
      $('#login').css({display: 'block'})//();
    };

    this.triggers.events.auth_failed = function(controller) {
      maze.toast('error, error');
    }
  };
})();