;(function() {
  'use strict';
  mlab.pkg('blf.modules.customInputs');

  // Loading Handlebars templates:
  blf.templates.require([
    'IdentifierField',
    'IdentifierField.line'
  ]);

  /**
   * This custom input is used to represent identifier-like properties.
   *
   * Data sample:
   * ************
   *
   *  > {
   *  >   id_type: "isbn",
   *  >   label: "ISBN",
   *  >   multiple: true,
   *  >   only_one: true,
   *  >   property: "identifiers",
   *  >   required: false,
   *  >   type_ui: "IdentifierField"
   *  > }
   */
  blf.modules.customInputs.IdentifierField = function(obj) {
    domino.module.call(this);

    var _dom,
        _self = this;

    _dom = $(blf.templates.get('IdentifierField')({
      label: obj.label || obj.labels[controller.get('assets_lang')]
    }));

    // Bind events:
    $('button.add-identifier', _dom).click(function() {
      addLine();
    });

    _dom.click(function(e) {
      var target = $(e.target),
          li = target.closest('li');

      // Check if it is a field button:
      if (li.length && target.is('button.remove-identifier')) {
        li.remove();
        checkValuesCount();
      }
    });

    // Init:
    if (obj.required) {
      $('button.add-identifier', _dom).click();
      $('li:first-child button.remove-identifier', _dom).css('display', 'none');
    }

    // Check that all values are not added yet:
    function checkValuesCount() {
      if (obj.multiple && obj.only_one && $('li', _dom).length)
        $('button.add-identifier', _dom).css('display', 'none');
      else
        $('button.add-identifier', _dom).css('display', '');
    }

    function addLine(o) {
      var li = $(blf.templates.get('IdentifierField.line')({
            value: (o || {}).value || ''
          }));

      $('ul.identifiers-list', _dom).append(li);
      checkValuesCount();
    }

    function _fill(data, fullData) {
      $('ul.identifiers-list', _dom).empty();

      (data || []).filter(function(o) {
        return o.id_type === obj.id_type;
      }).forEach(addLine);
    }

    function _getData(data) {
      var lis = $('li', _dom),
          res;

      data = data || {};

      if (obj.multiple) {
        res = data[obj.property] || [];
        lis.each(function() {
          res.push({
            id_type: obj.id_type,
            value: $(this).find('input').val()
          });
        });
      } else {
        res = lis.length ?
          {
            id_type: obj.id_type,
            value: $('li:first-child input', _dom).val()
          } :
          null;
      }

      if ((domino.struct.get(res) !== 'array') || res.length)
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
        $('.message', _dom).text(i18n.t('customInputs:IdentifierField.errors.exactly_one'));
        return false;
      }

      // Check multiple && required:
      if (obj.multiple && obj.required && data.length < 1) {
        $('.message', _dom).text(i18n.t('customInputs:IdentifierField.errors.at_least_one'));
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
