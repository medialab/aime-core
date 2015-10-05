// The overall sos procedure
(function() {
  'use strict';

  mlab.pkg('maze.domino.modules');
  maze.domino.modules.Sos = function() {
    domino.module.call(this);

    var _self = this,
        box;

    var dismiss = function() {
      // abandon.
      box.hide();
      _self.dispatchEvent('sos_dismiss');
    };

    // Displaying the form
    this.triggers.events.sos_require = function(controller, res) {
      $('#sos').replaceWith(maze.engine.template.sos());
      box = $('#sos');
      box.show();

      box.on('click', '[data-action=close]', function(e) {
        e.preventDefault();
        dismiss();
      });
    };
  };
})();
