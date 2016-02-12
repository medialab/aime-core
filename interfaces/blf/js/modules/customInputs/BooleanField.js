;(function() {
  'use strict';
  mlab.pkg('blf.modules.customInputs');

  // Loading Handlebars templates:
  blf.templates.require('BooleanField');

  /**
   * This custom input is used to represent a multiply selectable list.
   *
   * Data sample:
   * ************
   *
   *  > {
   *  >   labels: "Label",
   *  >   property: "labels",
   *  >   type_ui: "BooleanField"
   *  > }
   */
  blf.modules.customInputs.BooleanField = function(obj) {
    domino.module.call(this);

    var _dom,
        _list = [],
        _self = this;

    generate();

    function generate() {
      _dom = $(blf.templates.get('BooleanField')({
        label: obj.label
      }));
    }

    function _fill(data) {
      $('input', _dom).attr('checked', data);
    }

    function _getData(data) {
      return $('input', _dom).is(':checked');
    }

    function _validate() {
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
