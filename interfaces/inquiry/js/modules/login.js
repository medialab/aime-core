// The overall login/signup procedure
(function() {
  'use strict';

  mlab.pkg('maze.domino.modules');
  maze.domino.modules.Login = function() {
    domino.module.call(this);

    var _self = this, 
        box;  

    /*
      [authenticate] events handling once the UI is ready
    */
    this.triggers.events.session__initialized = function() {
      console.log('login', '@session__initialized');
      $('#login').replaceWith(maze.engine.template.login());
      box = $('#login');
      $('#loginForm').submit(function(e){
        e.preventDefault();
      });
      box.on('click', '[data-action=authenticate]', function(e) {
        console.log('launching procedure');
        _self.dispatchEvent('auth_require', {
          email: $('#email').val(),
          password: $('#password').val()
        });

      });

      box.on('click', '[data-action=signup]', function(e) {
        box.hide();
        _self.dispatchEvent('signup_require');

      });
      
    };

    /*
      listening on login requests
    */

    this.triggers.events.authorization__updated = function(controller, res) {
      var level = controller.get('authorization');
      
      switch(level) {
        case maze.AUTHORIZATION_REQUIRED:
          box.show();
          break;
        case maze.AUTHORIZATION_FAILED:
          maze.toast('error please try again');
          box.show();
          break;
        case maze.AUTHORIZATION_AUTHORIZED:
          _self.dispatchEvent('scene__initialize');
          box.hide();
          break;
        default:
          box.hide();
          break;
      }
      console.log('login', '@authorization__updated with', level, box);
      
    };


      
  };
})();