// The overall login/signup procedure
(function() {
  'use strict';

  mlab.pkg('maze.domino.modules');
  maze.domino.modules.SignUp = function() {
    domino.module.call(this);

    var _self = this,
        box,
        step = 0,
        limit = 4; // curent step number.

    var validations =[
      /*
        Step: 1
      */
      {
        'name': {
          minLength: {
            value: 2,
            message: maze.i18n.translate('signup_name_invalid')
          },
          maxLength: {
            value: 36,
            message: maze.i18n.translate('signup_name_invalid')
          }
        },
        'signup-surname': {
          minLength: {
            value: 2,
            message: maze.i18n.translate('signup_surname_invalid')
          },
          maxLength: {
            value: 36,
            message: maze.i18n.translate('signup_surname_invalid')
          }
        },
        'signup-email': {
            email: {
              message: maze.i18n.translate('email_invalid')
            }
        },
        'signup-email-confirm': {
            equal_to_field: {
              value: '#signup-email',
              message: maze.i18n.translate('email_not_matching')
            }
        },
        'signup-agreement':{
          checked:{
            value: '',
            message: maze.i18n.translate('accept_the_terms')
          }
        }
      },
      /*
        Step: 2
      */
      {
        'signup-password':{
          minLength: {
            value: 8,
            message: maze.i18n.translate('password_invalid')
          },
        },
        'signup-password-confirm':{
          equal_to_field: {
            value: '#signup-password',
            message: maze.i18n.translate('password_not_matching')
          }
        }
      },
    ];

    addCustomFormValidation('equal_to_field', function(input, data) {
      return input.val() == $(data.value).val();
    });
    /*
      goto current step. mode slider
    */
    var browse = function() {
      _self.log('slide to', step)
      box.find('.slider .wrapper').css({
        top: -step * 100 + '%'
      }).parent().scrollTop(0);

    };

    var nextStep = function() {
      _self.log('Form sucessfully validated for step:', step);
      step++;
      step = Math.min(step, limit);
      browse();
    }

    /* goto special pages */
    var browseSpecial = function(page) {
      _self.log('slide to', page)
      box.find('.slider .wrapper').css({
        top: -page * 100 + '%'
      }).parent().scrollTop(0);
    };
    /*
      [authenticate] events handling once the UI is ready
    */
    this.triggers.events.session__initialized = function() {
      _self.log('this.triggers.events.session__initialized');
      $('#signup').replaceWith(maze.engine.template.signup());
      box = $('#signup');
      /*
        Event handlers are bound to box only
      */
      box.on('click', '[data-action=proceed]', function(e) {
        _self.log('launching signup procedure');
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
        // validate before going somewhere. BEWARE!
        if(step < limit)
          $('#signupForm').setValidationRules(validations[step], nextStep,{
            preventDefault: true,
            overrideRules: true, 
            error: function(){
              browse();
            }
          });
        else {
          _self.dispatchEvent('signup_register', {
            email:    $('#signup-email').val(),
            password: $('#signup-password').val(),
            name:     $('#signup-name').val(),
          });
        }
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