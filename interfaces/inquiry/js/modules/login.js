// The overall login/signup procedure
(function() {
  'use strict';

  mlab.pkg('maze.domino.modules');
  maze.domino.modules.Login = function() {
    domino.module.call(this);

    var _self = this,
        box;

    var validation = {
        'email': {
            email: {
              message: maze.i18n.translate('email_invalid')
            }
        }
    };

    /*
      [authenticate] events handling once the UI is ready
    */
    this.triggers.events.session__initialized = function() {
      _self.log('@session__initialized');
      $('#login').replaceWith(maze.engine.template.login());
      box = $('#login');
      // $('#loginForm').submit(function(e){
      //    e.preventDefault();
      // });
      $('#loginForm').setValidationRules(validation, function() {
        _self.log('Form sucessfully validated :D');
        _self.dispatchEvent('auth_require', {
          email: $('#email').val(),
          password: $('#password').val()
        })
      },{
        preventDefault: true
      });



      box.on('click', '[data-action=signup]', function(e) {
        box.hide();
        _self.dispatchEvent('signup_require');

      });

      box.on('click', '[data-action=sos]', function(e) {
        box.hide();
        _self.dispatchEvent('sos_require');
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
        case maze.AUTHORIZATION_RESET:
          box.hide();
          break;
        default:
          box.hide();
          break;
      }
      _self.log('@authorization__updated with', level);

    };



  };
})();
