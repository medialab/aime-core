// The overall sos procedure
(function() {
  'use strict';

  mlab.pkg('maze.domino.modules');
  maze.domino.modules.Reset = function() {
    domino.module.call(this);

    var _self = this,
        box;

    var dismiss = function() {
      // abandon.
      box.hide();
      _self.dispatchEvent('sos_dismiss');
    };

    // Displaying the form
    this.triggers.events.reset_require = function(controller, res) {
      $('#reset').replaceWith(maze.engine.template.reset());
      box = $('#reset');
      box.show();

      box.on('click', '[data-action=confirm]', function(e) {
        e.preventDefault();

        var password = $('#password').val(),
            repeat = $('#repeat').val();

        if (!password)
          return;

        if (password.length < 8)
          return maze.toast(maze.i18n.translate('password_invalid'),{stayTime:2000});

        if (password !== repeat)
          return maze.toast(maze.i18n.translate('reset_invalid'),{stayTime:2000});

        return maze.domino.controller.dispatchEvent('reset_register', password);
      });
    };
  };
})();
