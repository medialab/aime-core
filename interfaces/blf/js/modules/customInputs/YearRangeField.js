;(function() {
  'use strict';
  mlab.pkg('blf.modules.customInputs');

  // Loading Handlebars templates:
  blf.templates.require('YearRangeField');

  /**
   * This custom input is used to represent a multiply selectable list.
   *
   * Data sample:
   * ************
   *
   *  > {
   *  >   labels: "Year",
   *  >   property_begin: "filter_date_begin",
   *  >   property_end: "filter_date_end",
   *  >   type_ui: "YearRangeField"
   *  > }
   */
  blf.modules.customInputs.YearRangeField = function(obj) {
    domino.module.call(this);

    var _dom,
        _list = [],
        _self = this;

    generate();

    function generate() {
      _dom = $(blf.templates.get('YearRangeField')({
        label: obj.label
      }));
    }

    function _fill(data, fullData) {
      $('.date-from', _dom).val(fullData[obj.property_begin]);
      $('.date-to', _dom).val(fullData[obj.property_end]);
    }

    function _getData(data) {
      if ($('.date-from', _dom).val())
        data[obj.property_begin] = $('.date-from', _dom).val();
      if ($('.date-to', _dom).val())
        data[obj.property_end] = $('.date-to', _dom).val();
    }

    function _validate() {
      var data = {};
      _getData(data);

      if (+data[obj.property_begin] > +data[obj.property_end]) {
        $('.message', _dom).text(i18n.t('customInputs:YearRangeField.errors.wrong_order'));
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
