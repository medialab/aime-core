;(function(undefined) {
  'use strict'

  mlab.pkg('maze.domino.modules');

  /*
    Rangy library wrapper
    ---

    Handle text selection and dispatch maze.domino events
  */
  maze.domino.modules.Editor = function(controller) {
    domino.module.call(this);

    var _self = this,
        _contrib,
        fields = {},
        slides = [],
        id = 0;

    var Field = function( options ){
      var f = this;
      $.extend( f, {
        id: -1,
        type: -1,
        selector: ''
      }, options );
    }

    var Slide = function( options ){
      var s = this;
      this.id=0;
      this.fields = [];
    };

    // Returns the current ID:
    function currentId() {
      return $('#edit-contribution').attr('data-contribution-id');
    }

    // Returns the target (a bit expensive, use another target if possible):
    function getTarget() {
      return $('#edit-contribution .slide[data-index="' + getIndex() + '"]');
    }

    // Returns the index:
    function getIndex() {
      return +$('#edit-contribution .slides-wrapper').attr('data-current-index');
    }

    // Useful function to check if the form is different from the data:
    function needUpdate(target) {
      var slide,
          dom = target.closest('.slide'),
          index = +dom.attr('data-index') || 0;

      try {
        // Main slide (title + objection)
        if (index == 0) {
          dom = dom.closest('.contribution');
          return ($('.contr-title', dom).val() !== (_contrib.title || {}).content) ||
                 ($('.contr-objection', dom).val() !== _contrib.objection);

        // Additional slides (refs + urls)
        } else {
          slide = _contrib.slides_opened[index - 1];
          return ($('.slide-description', dom).val() !== (slide.pertinence || '')) ||
                 ($('.slide-ref', dom).val() !== (slide.reference || '')) ||
                 ($('.slide-link', dom).val() !== (slide.url || ''));
        }
      } catch(e) {
        maze.domino.controller.log('Contribution seems invalid:', _contrib);
        return true;
      }
    }

    // Useful function to validate the form:
    function validate(target) {
      var o,
          slide,
          dom = target.closest('.slide'),
          index = +dom.attr('data-index') || 0;

      try {
        // Main slide (title + objection)
        if (index == 0) {
          dom = dom.closest('.contribution');
          return $('.contr-title', dom).val() &&
                 $('.contr-objection', dom).val();

        // Additional slides (refs + urls)
        } else {
          o = {
            d: $('.slide-description', dom).val(),
            l: $('.slide-link', dom).val(),
            r: $('.slide-ref', dom).val()
          };
          // we need at least one field
          return o.d || o.l || o.r;
        }
      } catch(e) {
        maze.domino.controller.log('Problems during editing form validation:', _contrib);
        return true;
      }
    }

    // Useful function to save the current slide:
    function save(target, options) {
      var slide,
          o = options || {},
          valid = o.forceValidate || validate(target),
          different = o.forceSave || needUpdate(target),
          dom = target.closest('.slide'),
          index = +dom.attr('data-index') || 0;

      try {
        // Main slide (title + objection)
        if (index == 0) {
          dom = dom.closest('.contribution');
          if (valid && different && (!o.confirm || confirm(o.confirm)))
            _self.dispatchEvent('update_contribution', {
              content: $('.contr-title', dom).val(),
              objection: $('.contr-objection', dom).val(),
              id: currentId(),
              callback: function(contribution) {
                _contrib = contribution;

                if ('status' in _contrib)
                  $('#edit-contribution').attr('data-private-status', _contrib.status);

                if (o.callback)
                  o.callback();
                else
                  // without the setTimeout, the toast directly disappears...
                  window.setTimeout(function() {
                    maze.toast(maze.i18n.translate('the contribution has been successfully saved'));
                  }, 400);
              }
            });
          else if (!valid)
            maze.toast( maze.i18n.translate('please enter a title and an objection'));
          else if (!different && o.callback)
            o.callback();

        // Additional slides (refs + urls)
        } else {
          if (valid && different && (!o.confirm || confirm(o.confirm))) {
            _self.dispatchEvent('update_contribution_slide', {
              id: dom.attr('data-id'),
              ref: $('.slide-ref', dom).val(),
              ref_url: $('.slide-link', dom).val(),
              content: $('.slide-description', dom).val(),
              callback: function(contribution) {
                _contrib = contribution;

                if (o.callback)
                  o.callback();
                else
                  maze.toast( maze.i18n.translate('the slide has been successfully saved'));
              }
            });
          } else if (!valid)
            maze.toast( maze.i18n.translate('please enter a description, a link or a reference'));
          else if (!different && o.callback)
            o.callback();
        }
      } catch(e) {
        maze.domino.controller.log('Cannot save contribution/slide:', _contrib);

        if (o.fallback)
          o.fallback();
      }
    }

    this.triggers.events.notebook_discard = function(controller) {
      maze.domino.controller.update('is_editing', false);
      $('#edit-contribution').remove();
      //maze.domino.controller.dispatchEvent('slider_disable');
    };

    this.triggers.events.slider_to = function(controller, event) {
      var target = getTarget();

      if (target.length)
        // Check that the current slide saved:
        save(target, {
          callback: function() {
            event.data.selector = "#edit-contribution";
            _self.dispatchEvent('execute_slider_to', event.data);
          },
          fallback: function() {
            if (getIndex() === 0)
              maze.toast( maze.i18n.translate('please enter a title and an objection'));
            else
              maze.toast( maze.i18n.translate('please enter a description, a link or a reference'));
          }
        });
      else
        _self.dispatchEvent('execute_slider_to', event.data);
    };

    this.triggers.events.execute_slider_to = function(controller, event) {
      $('#edit-contribution textarea.contr-title').attr('disabled', (event.data.index == 0) ? null : 'disabled');
    };

    this.triggers.events.open_editor_execute = function(controller, event){
      _contrib = event.data.contribution || {}

      var contribId = event.data.id || _contrib.id;
      
      _self.dispatchEvent('columnify', {
        callback: function() {
          $('#edit-contribution').remove();

          var dom = $(maze.engine.template.editor({
            author: _contrib.author || maze.user,
            date:   maze.today,
          })).prependTo(maze.columns.com.find(".wrapper"));

          dom.attr('data-contribution-id', contribId);
          if ('status' in _contrib)
            dom.attr('data-private-status', _contrib.status);

          $('.contr-title', dom).val((_contrib.title || {}).content || '');
          $('.contr-objection', dom).val(_contrib.objection || '');

          maze.move.open('#edit-contribution', {
            callback: function() {
              $('#edit-contribution textarea[name=title]', dom).focus();
              _self.dispatchEvent('slider_init',{
                selector: '#edit-contribution',
                slides: _contrib.slides_opened,
                type: 'contribution',
                slide: 0
              });
            }
          });
        }
      });

      fields.title = new Field({
        selector: '#edit-contribution .contr-title',
        type: maze.TYPE_CONTRIBUTION_TITLE
      });

      fields.objection = new Field({
        selector: '#edit-contribution .contr-objection',
        type: maze.TYPE_CONTRIBUTION_OBJECTION
      });

      maze.log(fields);
    };


    // BIND LISTENERS:
    // ***************
    maze.on('click', '.remove-contribution', function(event) {
      var dom = $(event.currentTarget).closest('.contribution');

      if (confirm(maze.i18n.translate('are you sure you want to delete this contribution?')))
        _self.dispatchEvent('delete_contribution', {
          id: currentId(),
          column: controller.get('scene_column').leading
        });
    });

    maze.on('click', '.save-contribution', function(event) {
      save($(event.currentTarget));
    });

    maze.on('click', '.publish-contribution', function(event) {
      save($(event.currentTarget), {
        callback: function() {
          _self.dispatchEvent('publish_contribution', {
            id: currentId(),
            callback: function(contribution) {
              _contrib = contribution;

              window.setTimeout(function() {
                maze.toast( maze.i18n.translate('the contribution has been successfully published'));
              }, 400);

              if ('status' in _contrib)
                $('#edit-contribution').attr('data-private-status', _contrib.status);
            }
          });
        }
      });
    });

    maze.on('click', '.unpublish-contribution', function(event) {
      save($(event.currentTarget), {
        callback: function() {
          _self.dispatchEvent('unpublish_contribution', {
            id: currentId(),
            callback: function(contribution) {
              _contrib = contribution;

              window.setTimeout(function() {
                maze.toast( maze.i18n.translate('the contribution has been successfully unpublished'));
              }, 400);

              if ('status' in _contrib)
                $('#edit-contribution').attr('data-private-status', _contrib.status);
            }
          });
        }
      });
    });
    
    maze.on('click', '.add-slide', function(event) {
      save($(event.currentTarget), {
        callback: function() {
          _self.dispatchEvent('add_contribution_slide', {
            id: currentId(),
            callback: function(contribution) {
              _contrib = contribution;

              _self.dispatchEvent('slider_add_slide', {
                slideTo: true,
                selector: "#edit-contribution",
                template: maze.engine.template.slide(
                  _contrib.slides_opened[_contrib.slides_opened.length - 1]
                )
              });
            }
          });
        }
      });
    });

    maze.on('click', '.close-editor', function(event) {
      // Check that the current slide saved:
      save(getTarget(), {
        confirm: maze.i18n.translate('are you sure you want to leave the editor?'),
        callback: function() {
          _self.dispatchEvent('notebook_discard');
        },
        fallback: function() {
          if (getIndex() === 0)
            maze.toast( maze.i18n.translate('please enter a title and an objection'));
          else
            maze.toast( maze.i18n.translate('please enter a description, a link and a reference'));
        }
      });
    });

    maze.on('click', '.remove-slide', function(event) {
      var slide = $(event.currentTarget).closest('.slide');

      if (confirm(maze.i18n.translate('are you sure you want to delete this document?')))
        _self.dispatchEvent('remove_contribution_slide', {
          id: slide.attr('data-id'),
          callback: function(contribution) {
            _contrib = contribution;

            _self.dispatchEvent('slider_remove_slide', {
              index: slide.attr('data-index'),
              selector: "#edit-contribution"
            });
          }
        });
    });

    maze.on('click', '.save-slide', function(event) {
      save($(event.currentTarget));
    });

    // Here we catch the parent of the title, because when it's disabled, it is
    // not possible to catch the click event:
    maze.on('click', '.editor .subtitle .table', function(event) {
      if (getIndex() !== 0)
        _self.dispatchEvent('slider_to', {
          selector: "#edit-contribution",
          index: 0
        });
    });

    $(document).keyup(function(e) {
      if (
        e.keyCode == 27 &&
        getTarget().length &&
        !maze.domino.controller.get('ui_lock')
      )
        // Check that the current slide saved:
        save(getTarget(), {
          confirm: maze.i18n.translate('are you sure you want to leave the editor?'),
          callback: function() {
            _self.dispatchEvent('notebook_discard');
          },
          fallback: function() {
            if (getIndex() === 0)
              maze.toast( maze.i18n.translate('please enter a title and an objection'));
            else
              maze.toast( maze.i18n.translate('please enter a description, a link and a reference'));
          }
        });
    });
  };
})();
