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

    

    /*
      goto current step. mode slider
    */
    var browse = function() {
      box.find('.slider .wrapper').css({
        top: -step * 100 + '%'
      });
    };

    /*
      Clean and Verify registration.
    */
    var is_valid = function() {
      // steps
      var user = {
        email:        $('#signup-email').val(),
        password:     $('#signup-password').val(),
        name:         $('#signup-name').val(),
        surname:      $('#signup-surname').val(),

        institution:  $('#signup-institution').val(),
        department:   $('#signup-department').val(),
        discipline:   $('#signup-discipline').val(),
      };

      //if(field.attr('required'))
      for(var i in fields) {

      }

      var is_defined = user.email && user.password && user.name && user.surname;
      
      if(!is_defined){
        maze.toast('some values missing');
        return false;
      }
        

      var has_values = user.email.length && user.password.length && user.name.length && user.surname.length;
      
      return has_values;

    }

    /*
      [authenticate] events handling once the UI is ready
    */
    this.triggers.events.session__initialized = function() {
      console.log('this.triggers.events.session__initialized');
      $('#signup').replaceWith(maze.engine.template.signup());
      box = $('#signup');
      /*
        Event handlers are bound to box only
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

      box.on('click', '[data-action=validate]', function(e) {
        e.preventDefault();
        // console.log(user)
        // return;
        if(is_valid()) {
          _self.dispatchEvent('signup_register', {
            email:    user.email,
            password: user.password,
            name:     user.name,
            surmame:  user.surname, 
          });
        };
        //box.hide();
      });

    };

    /*
      showing popup on signinrequired, and corresponding atuh level
    */

    this.triggers.events.signup_require = function(controller, res) {
      box.show();
    }
    
    
  

    


  };
})();