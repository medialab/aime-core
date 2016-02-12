;(function() {
  'use strict';
  mlab.pkg('blf.modules.customInputs');

  // Loading Handlebars templates:
  blf.templates.require([
    'CharField',
    'CharField.line'
  ]);

  /**
   * This custom input is used to represent string properties.
   *
   * Data sample:
   * ************
   *
   *  > {
   *  >   "labels": {
   *  >     "en": "CharField multiple",
   *  >     "fr": "CharField multiple"
   *  >   },
   *  >   "multiple": true,
   *  >   "property": "chars",
   *  >   "required": false,
   *  >   "type_ui": "CharField"
   *  > }
   */
  blf.modules.customInputs.CharField = function(obj, controller) {
    domino.module.call(this);

    var _dom,
        _self = this;

    _dom = $(blf.templates.get('CharField')({
      label: obj.label || obj.labels[controller.get('assets_lang')]
    }));

    // Add empty line:
    // addLine();

    // Bind events:
    $('button.add-line', _dom).click(function() {
      addLine();
    });

    _dom.click(function(e) {
      var target = $(e.target),
          li = target.closest('li');

      // Check if it is a field button:
      if (li.length && target.is('button.remove-line')) {
        li.remove();
        checkValuesCount();
      }
    });

    // Init:
    if (obj.required) {
      $('button.add-line', _dom).click();
      $('li:first-child button.remove-line', _dom).css('display', 'none');
    }

    // Check that all values are not added yet:
    function checkValuesCount() {
      if (!obj.multiple || (obj.only_one && $('li', _dom).length))
        $('button.add-line', _dom).css('display', 'none');
      else
        $('button.add-line', _dom).css('display', '');
    }

    function addLine(s) {
      var li = $(blf.templates.get('CharField.line')({
            value: s || ''
          }));

      $('ul.lines', _dom).append(li);
      checkValuesCount();
    }

    function _fill(data, fullData) {
      $('ul.lines', _dom).empty();

      if (domino.struct.check('array', data))
        data.forEach(addLine);
      else if (data)
        addLine(data);

      if (!data)
        addLine();

      if (!obj.multiple)
        $('button.remove-line', _dom).remove();
    }

    function _getData(data) {
      var lis = $('li', _dom),
          res,
          val;

      data = data || {};

      if (obj.multiple) {
        res = [];
        lis.each(function() {
          val = $(this).find('input').val();

          if (val)
            res.push(val);
        });
      } else
        res = lis.length ? $('li:first-child input', _dom).val() : undefined;

      if ((domino.struct.get(res) === 'array') ? res.length : res)
        data[obj.property] = (data[obj.property] || []).concat(res);

      return res;
    }

    function _validate() {
      var data = _getData();

      // Check !multiple && required:
      if (
        (!obj.multiple && obj.required && !data) ||
        (obj.multiple && obj.required && obj.only_one && !data)
      ) {
        $('.message', _dom).text(i18n.t('customInputs:CharField.errors.exactly_one'));
        return false;
      }

      // Check multiple && required:
      if (obj.multiple && obj.required && data.length < 1) {
        $('.message', _dom).text(i18n.t('customInputs:CharField.errors.at_least_one'));
        return false;
      }

      $('.message', _dom).empty();
      return true;
    }

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
