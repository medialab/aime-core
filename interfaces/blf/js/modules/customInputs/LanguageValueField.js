;(function() {
  'use strict';
  mlab.pkg('blf.modules.customInputs');

  // Loading Handlebars templates:
  blf.templates.require([
    'LanguageValueField',
    'LanguageValueField.line'
  ]);

  /**
   * This custom input can be used to add several entries for different
   * languages.
   *
   * Data sample:
   * ************
   *
   *  > {
   *  >   labels: {
   *  >       en: "Abstracts",
   *  >       fr: "Resumés"
   *  >   },
   *  >   multiple: true,
   *  >   property: "descriptions",
   *  >   required: false,
   *  >   type_data: "LanguageValue",
   *  >   type_ui: "LanguageValueField"
   *  > }
   */
  blf.modules.customInputs.LanguageValueField = function(obj, controller) {
    domino.module.call(this);

    var _dom,
        _selected = {},
        _languages = blf.utils.extractMajors(controller.get('lists').language || []),
        _separators = _languages.filter(function(o) { return o.separator; }).length;

    // Try to get the list:
    // AAARGH: How am I supposed to do when I add a module that needs to
    //         dispatch an event when bindings are actually not existing yet?
    //         So... here is one dirty solution, waiting for something cleaner:
    //
    //         => https://github.com/jacomyal/domino.js/issues/35
    window.setTimeout(function() {
      if (!_languages.length)
        _self.dispatchEvent('loadList', {
          list: 'language'
        });
    }, 0);

    _dom = $(blf.templates.get('LanguageValueField')({
      label: obj.label || obj.labels[controller.get('assets_lang')]
    }));

    // Bind events:
    $('button.add-language', _dom).click(function() {
      addLanguage();
    });

    // Bind events:
    _dom.click(function(e) {
      var target = $(e.target),
          li = target.parents('li');

      // Check if it is a field button:
      if (li.length && target.is('button.remove-language')) {
        li.remove();
        checkLanguagesCount();
        checkLanguagesDups();
      }
    });

    // Add a line. The line is empty (ie to be filled by the user) if data is
    // not specified.
    function addLanguage(data) {
      data = data || {};
      var li = $(blf.templates.get('LanguageValueField.line')({
        languages: _languages.map(function(o) {
          return o.separator ? {
            separator: true
          } : {
            id: o.type_id,
            label: o.label || o.labels[controller.get('assets_lang')]
          };
        })
      }));

      if (data.language)
        $('select.select-language', li).val(data.language);

      // If the language is not specified, we use the first language that is
      // not used yet:
      else
        _languages.some(function(lang) {
          if (lang.type_id && !$('option[value="' + lang.type_id + '"]:selected', _dom).length)
            return $('select.select-language', li).val(lang.type_id);
        }, null);


      if (data.value)
        $('textarea', li).val(data.value);

      $('select.select-language', li).change(checkLanguagesDups);
      $('ul.languages-list', _dom).append(li);
      checkLanguagesCount();
      checkLanguagesDups();
    }

    // Check that all languages are not added yet:
    function checkLanguagesCount() {
      if ($('li', _dom).length >= _languages.length - _separators)
        $('button.add-language', _dom).css('display', 'none');
      else
        $('button.add-language', _dom).css('display', '');
    }

    // Deal with languages deduplication:
    function checkLanguagesDups() {
      var list = $('select.select-language', _dom);

      // Find selected languages:
      _selected = {};
      list.each(function() {
        _selected[$(this).val()] = 1;
      });

      // Disable selected values:
      $('option', _dom).attr('disabled', null);
      $('option.disabled', _dom).attr('disabled', 'true');
      for (var k in _selected)
        $('option[value="' + k + '"]:not(:selected)', _dom).attr('disabled', 'true');
    }

    /**
     * Check if the content of the component is valid. Returns true if valid,
     * and false if not.
     *
     * @return {string} Returns true if the content id valid, and false else.
     */
    function _validate() {
      var data = _getData();

      if (obj.required && (!data || !data.length)) {
        $('.message', _dom).text(i18n.t('customInputs:LanguageValueField.errors.at_least_one'));
        return false;
      }

      $('.message', _dom).empty();
      return true;
    }

    /**
     * Fill the component with existing data.
     *
     * @param  {object} data The data to display in the component.
     * @param  {object} full The full entry (sometimes might be needed).
     */
    function _fill(data) {
      var li,
          ul = $('ul.languages-list', _dom).empty();

      // Parse data and create lines:
      (data || []).forEach(addLanguage);
    }

    /**
     * Returns the well-formed data described by the component.
     *
     * @return {*} The data.
     */
    function _getData() {
      var languages = [];

      // Parse line and form data:
      $('ul.languages-list > li', _dom).each(function() {
        var li = $(this);

        languages.push({
          language: $('> select', li).val(),
          value: $('> textarea', li).val()
        });
      });

      return languages.length ? languages : undefined;
    }

    // Domino bindings:
    this.triggers.events.listsUpdated = function(controller) {
      var list = controller.get('lists').language || [];

      if (!(_languages || []).length && list.length) {
        _languages = blf.utils.extractMajors(list);
        _separators = _languages.filter(function(o) { return o.separator; }).length;

        $('select.select-in-type', _dom).empty().append(getLineContent());
      }
    };

    this.getComponent = function() {
      return {
        dom: _dom,
        fill: _fill,
        getData: _getData,
        validate: _validate,
        propertyObject: obj,
        property: obj.property
      };
    };
  };
})();
