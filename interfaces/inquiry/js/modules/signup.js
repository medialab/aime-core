// The overall login/signup procedure
(function() {
  'use strict';

  mlab.pkg('maze.domino.modules');
  maze.domino.modules.SignUp = function() {
    domino.module.call(this);

    var _self = this,
        box,
        step = 0,
        limit = 5; // 0 is no special, -1 is 

    var validations =[{},{},
      /*
        Step: 1
      */
      {
        'signup-name': {
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
        
        // 'signup-agreement':{
        //   checked:{
        //     value: '',
        //     message: maze.i18n.translate('accept_the_terms')
        //   }
        // }
      },
      /*
        Step: 2
      */
      {
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
      },
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
      });
      box.find('.slider').scrollTop(0)

      if(step == limit)
        $("[data-action=next]").text(maze.i18n.translate('done'))
      else
        $("[data-action=next]").text(maze.i18n.translate('next'))


      //console.log(box.find('.slide[data-step='+step+'] input').first());
    };

    var nextStep = function() {
      _self.log('Form sucessfully validated for step:', step);
      step++;
      step = Math.min(step, limit);
      browse();
    }

    // dismiss handler, on click
    var dismiss = function() {
      // abandon.
      box.hide();
      _self.dispatchEvent('signup_dismiss');
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
      box.on('click', '[data-action=terms-of-use]', function(e) {
        _self.log('view terms of use');

      });

      box.find('input').keydown(function(event){
        console.log('is last the target', $(event.target));
        if( event.keyCode === 9 && $(event.target).hasClass('tab-last')) {
          event.preventDefault();
          //step++;
          // try to submit the form
          //$('#signupForm').submit();
        }
        // if it is not in the same step, prevent default
        //$('.slide[data-step='+step+'] input:focus')
        //if (event.keyCode === 9) {
        //  event.preventDefault();
        //}

        // focus different stuffs
        // cycle inside various stuffs


      })
      // previous slide
      box.on('click', '[data-action=previous]', function(e) {
        e.preventDefault();
        step--;
        if(step < 0) {
          step = 0;
          dismiss();
        } else {
          browse();
        }
      });

      // init listeners
      box.on('click', '[data-action=close]', function(e) {
        e.preventDefault();
        dismiss();
      });

      box.on('click', '[data-action=next]', function(e) {
        // validate before going somewhere. BEWARE!
        if(step < limit)
          $('#signupForm').setValidationRules(validations[step], nextStep,{
            preventDefault: true,
            overrideRules: true, 
            error: function(){
              maze.toast(maze.i18n.translate('form_not_valid'))
              browse();
            }
          });
        else {
          _self.dispatchEvent('signup_register', {
            email:    $('#signup-email').val(),
            password: $('#signup-password').val(),
            name:     $('#signup-name').val(),
            surname:  $('#signup-surname').val(),
            department: $('#signup-department').val() || '',
            discipline: $('#signup-discipline').val() || '',
            institution: $('#signup-institution').val() || ''
          });
          dismiss();
        }
      });

      

    };

    /*
      showing popup on signinrequired, and corresponding atuh level
    */

    this.triggers.events.signup_require = function(controller, res) {
      step = 0;
      $('#signupForm input').val('');
      browse();
      // cleanup errors
      box.show();
    }
    
    
  

    


  };
})();