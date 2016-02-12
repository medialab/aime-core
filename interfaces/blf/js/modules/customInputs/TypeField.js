;(function() {
  'use strict';
  mlab.pkg('blf.modules.customInputs');

  // Loading Handlebars templates:
  blf.templates.require([
    'TypeField',
    'TypeField.line'
  ]);

  /**
   * This custom input is basically a combo, whose options are dynamically
   * loaded.
   *
   * Data sample:
   * ************
   *
   *  > {
   *  >   label: "Pays de publication",
   *  >   multiple: true,
   *  >   property: "publication_countries",
   *  >   required: false,
   *  >   type_source: "country",
   *  >   type_ui: "TypeField"
   *  > }
   */
  blf.modules.customInputs.TypeField = function(obj, controller) {
    domino.module.call(this);

    var _dom,
        _selected = {},
        _values = blf.utils.extractMajors(controller.get('lists')[obj.type_source] || []),
        _separators = _values.filter(function(o) { return o.separator; }).length,
        _self = this;

    // Try to get the list:
    // AAARGH: How am I supposed to do when I add a module that needs to
    //         dispatch an event when bindings are actually not existing yet?
    //         So... here is one dirty solution, waiting for something cleaner:
    //
    //         => https://github.com/jacomyal/domino.js/issues/35
    window.setTimeout(function() {
      if (!_values.length)
        _self.dispatchEvent('loadList', {
          list: obj.type_source
        });
    }, 0);

    _dom = $(blf.templates.get('TypeField')({
      label: obj.label || obj.labels[controller.get('assets_lang')],
      multi: !obj.only_one
    }));

    // Bind events:
    $('button.add-value', _dom).click(function() {
      addLine();
    });

    _dom.click(function(e) {
      var target = $(e.target),
          li = target.parents('ul.values-list > li');

      // Check if it is a field button:
      if (li.length && target.is('button.remove-value')) {
        li.remove();
        checkValuesCount();
        checkValuesDups();
      }
    });

    function getLineContent(value) {
      return _values.map(function(o) {
        return o.separator ?
          '<option class="disabled" disabled="disabled">---</option>' :
          '<option value="' + o.type_id + '">' + o.label + '</option>';
      }).join();
    }

    // Check that all values are not added yet:
    function checkValuesCount() {
      if (
        (!obj.multiple && $('li', _dom).length) ||
        ($('li', _dom).length >= _values.length - _separators)
      )
        $('button.add-value', _dom).css('display', 'none');
      else
        $('button.add-value', _dom).css('display', '');
    }

    // Deal with values deduplication:
    function checkValuesDups() {
      var list = $('ul.values-list > li > select', _dom);

      // Find selected values:
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

    function addLine(s) {
      var li = $(blf.templates.get('TypeField.line')({
        content: getLineContent()
      }));

      if (s)
        $('> select', li).val(s);

      // If the value is not specified, we use the first value that is
      // not used yet:
      else
        $('> select', li).val(_values.reduce(function(res, v) {
          return res !== null ?
            res :
            (v.type_id && !$('option[value="' + v.type_id + '"]:selected', _dom).length) ?
              v.type_id :
              null;
        }, null));

      $('select', li).change(checkValuesDups);
      $('ul.values-list', _dom).append(li);

      checkValuesCount();
      checkValuesDups();
    }

    /**
     * Fill the component with existing data.
     *
     * @param  {object} data The data to display in the component.
     * @param  {object} full The full entry (sometimes might be needed).
     */
    function _fill(data) {
      $('ul.values-list', _dom).empty();
      if (domino.struct.check('array', data))
        data.map(addLine);
      else if (data)
        addLine(data);
    }

    /**
     * Returns the well-formed data described by the component.
     *
     * @return {*} The data.
     */
    function _getData() {
      var dom,
          res;

      if (obj.multiple) {
        res = [];
        $('select', _dom).each(function() {
          res.push($(this).val());
        });

      } else {
        dom = $('select', _dom);

        if (dom.length)
          res = dom.first().val();
      }

      return ((domino.struct.get(res) !== 'array') || (res.length)) ? res : undefined;
    }

    function _validate() {
      var data = _getData();

      if (obj.required && (!data || !data.length)) {
        $('.message', _dom).text(i18n.t('customInputs:TypeField.errors.at_least_one'));
        return false;
      }

      $('.message', _dom).empty();
      return true;
    }

    /**
     * This method returns the component object.
     *
     * @return {object} The component object.
     */
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

    // Domino bindings:
    this.triggers.events.listsUpdated = function(controller) {
      var list = controller.get('lists')[obj.type_source] || [];

      if (!(_values || []).length && list.length) {
        _values = blf.utils.extractMajors(list);
        _separators = _values.filter(function(o) { return o.separator; }).length;

        $('select.select-in-type', _dom).empty().append(getLineContent());
      }
    };
  };
})();
