// The overall login/signup procedure
(function() {
  'use strict';

  mlab.pkg('maze.domino.modules');
  maze.domino.modules.SignUp = function() {
    domino.module.call(this);

    var _self = this,
        box,
        step = 0,
        limit = 6; // curent step number.

    $('#signup').replaceWith(maze.engine.template.signup());
    var box = $('#signup');

    /*
      goto current step. mode slider
    */
    var browse = function() {
      box.find('.slider .wrapper').css({
        top: -step * 100 + '%'
      });
    };
    /*
      [authenticate] events handling
    */
    box.on('click', '[data-action=proceed]', function(e) {
      console.log('launching signup procedure');
    });

    // init listeners
    box.on('click', '[data-action=previous]', function(e) {
      e.preventDefault();
      // validate here step specific content. Then slide!
      step--;
      step = Math.max(step, 0);
      browse();
    });

    // init listeners
    box.on('click', '[data-action=close]', function(e) {
      e.preventDefault();
      // abandon.
      box.hide();
      _self.dispatchEvent('signup_dismiss');
    });

    box.on('click', '[data-action=next]', function(e) {
      e.preventDefault();
      // validate here step specific content. Then slide!
      step++;
      step = Math.min(step, limit);
      browse();
    });

    /*
      showing popup on signinrequired, and corresponding atuh level
    */

    this.triggers.events.signup_require = function(controller, res) {
      box.show();
    }


  };
})();