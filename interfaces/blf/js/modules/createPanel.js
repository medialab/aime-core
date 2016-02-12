;(function() {
  'use strict';
  mlab.pkg('blf.modules.customInputs');

  // Loading Handlebars templates:
  blf.templates.require([
    'DateField',
    'IntegerField',
    'createPanel.validate'
  ]);

  // Module constructor:
  blf.modules.createPanel = function(html, controller) {
    domino.module.call(this);

    var _self = this,
        _html = html;

    /**
     * DOMINO BINDINGS:
     * ****************
     */
    this.triggers.events.displayForm = function(d, e) {
      var entry = e.data.entry,
          field = d.get('fields')[e.data.field],
          form = blf.modules.createPanel.generateForm(
            controller,
            d.get('fields')[e.data.field].children
          );

      $('.create-form', _html).empty().append(form.components.map(function(o) {
        return o.dom;
      }));

      $(blf.templates.get('createPanel.validate')()).click(function() {
        if (form.validate())
          _self.dispatchEvent('validateEntry', {
            entry: form.getData()
          });
      }).appendTo($('.create-form', _html));

      form.fill(entry || { rec_type: e.data.field });
    };
  };

  /**
   * FORM GENERATION STATIC HELPERS:
   * *******************************
   */
  mlab.pkg('blf.modules.createPanel.defaultMethods');
  blf.modules.createPanel.generateForm = function(controller, config) {
    // Form private properties:
    var _currentToKeep = {},
        _propertiesToAdd = {
          rec_class: 'Document',
        },
        _toKeep = [
          '_id',
          'rec_class',
          'rec_created_date',
          'rec_id',
          'rec_modified_date',
          'rec_source',
          'rec_status',
          'rec_type',
          'nonce'
        ],
        _components = [];

    // Just some local variables:
    var i,
        l,
        obj,
        module,
        component;

    // Parse children:
    for (i = 0, l = config.length; i < l; i++)
      _components.push(blf.modules.createPanel.getComponent(controller, config[i]));

    // Methods:
    function getData() {
      var k,
          value,
          data = domino.utils.clone(_currentToKeep);

      for (k in _propertiesToAdd)
        data[k] = _propertiesToAdd[k];

      for (i = 0, l = _components.length; i < l; i++) {
        component = _components[i];
        value = blf.modules.createPanel.getData(component, data);

        if (
          component.property !== undefined &&
          value !== undefined &&
          value !== null &&
          (!(value instanceof Array) || value.length) &&
          (!(typeof value === 'number') || !isNaN(value)) &&
          value !== ''
        )
          data[component.property] = value;
      }

      return data;
    }

    function validate() {
      var invalid = 0;

      controller.log('Form validation:');
      _components.forEach(function(component) {
        var isValid = blf.modules.createPanel.validate(component);

        if (!isValid)
          invalid++;

        if (!isValid)
          controller.log('  - Invalid component:', component.property);
      });

      if (invalid === 0) {
        controller.log('  - Everything is valid');
        return true;
      } else
        return false;
    }

    function fill(entry) {
      var i,
          parsed = {};

      // Store data to keep:
      _currentToKeep = _toKeep.reduce(function(o, k) {
        if (k in entry)
          o[k] = domino.utils.clone(entry[k]);
        return o;
      }, {});

      // Parse components
      for (i = 0, l = _components.length; i < l; i++) {
        component = _components[i];

        if (parsed[component.property])
          controller.log('Hum, the property "' + component.property + '" has already been given to a component...');

        parsed[component.property] = 1;

        if (entry)
          blf.modules.createPanel.fill(component, entry);
      }

      for (i in entry)
        if (!parsed[i])
          controller.log('Property not parsed:', i, 'value:', entry[i]);
    }

    return {
      components: _components,
      validate: validate,
      getData: getData,
      fill: fill
    };
  };

  /**
   * Instanciates and returns the good component.
   * @return {*} The component instance.
   */
  blf.modules.createPanel.getComponent = function(controller, obj) {
    var component,
        template,
        module = blf.modules.customInputs[obj.type_ui];

    // If a custom component is found:
    if (typeof module === 'function') {
      module = controller.addModule(module, [obj, controller]);
      component = module.getComponent();

    // Else, if a basic component is recognized:
    } else if (template = blf.templates.get(obj.type_ui))
      component = {
        propertyObject: obj,
        property: obj.property,
        dom: $(template({
          label: obj.label || obj.labels[controller.get('assets_lang')],
          property: obj.property
        }))
      };

    // If not recognized at all:
    else
      controller.warn('Data type "' + obj.type_ui + '" not recognized.');

    return component;
  };

  /**
   * Methods that work on every components:
   */
  blf.modules.createPanel.getData = function(component, data) {
    return component.getData ?
      component.getData(data) :
      blf.modules.createPanel.defaultMethods.getData.call(component);
  };

  blf.modules.createPanel.fill = function(component, entry) {
    if (component.fill)
      component.fill(component.property ? entry[component.property] : null, entry);
    else
      blf.modules.createPanel.defaultMethods.fill.call(
        component,
        entry[component.property],
        entry
      );
  };

  blf.modules.createPanel.validate = function(component) {
    return component.validate ?
      component.validate() :
      blf.modules.createPanel.defaultMethods.validate.call(component);
  };

  /**
   * The default "getData" method.
   * @return {*} The data to insert in the new entry.
   */
  blf.modules.createPanel.defaultMethods.getData = function() {
    var value = $('input', this.dom).val();

    // Check empty strings:
    if (value === '')
      value = undefined;

    // Check numbers:
    if ($('input', this.dom).attr('type') === 'number')
      value = +value;

    if (value !== undefined && this.propertyObject.multiple)
      value = [value];

    return value;
  };

  /**
   * The default "fill" method.
   * @param  {*} value The value to set in the input.
   */
  blf.modules.createPanel.defaultMethods.fill = function(value) {
    $('input', this.dom).val(value);
  };

  /**
   * The default "validate" method.
   * @return {boolean} "true" if valid, "false" else.
   */
  blf.modules.createPanel.defaultMethods.validate = function() {
    var isValid;

    if (this.propertyObject.required)
      isValid = (blf.modules.createPanel.getData(this)) !== undefined;
    else
      isValid = true;

    // Display a short message if there is no value and the property is
    // required:
    if (!isValid)
      $('.message', this.dom).text(i18n.t('customInputs:TypeField.errors.at_least_one'));
    else
      $('.message', this.dom).empty();

    return isValid;
  };
})();
