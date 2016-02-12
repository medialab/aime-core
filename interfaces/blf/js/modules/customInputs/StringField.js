;(function() {
  'use strict';
  mlab.pkg('blf.modules.customInputs');

  // Loading Handlebars templates:
  blf.templates.require('StringField');

  /**
   * This custom input is used to represent a multiply selectable list.
   *
   * Data sample:
   * ************
   *
   *  > {
   *  >   labels: "Label",
   *  >   property: "labels",
   *  >   type_ui: "StringField"
   *  > }
   */
  blf.modules.customInputs.StringField = function(obj) {
    domino.module.call(this);

    var _dom,
        _list = [],
        _self = this;

    generate();

    function generate() {
      _dom = $(blf.templates.get('StringField')({
        label: obj.label
      }));
    }

    function _fill(data, fullData) {
      $('.value', _dom).text(data);
    }

    function _getData(data) {
      return undefined;
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
