;(function() {
  'use strict';
  mlab.pkg('blf.modules.customInputs');

  // Loading Handlebars templates:
  blf.templates.require([
    'CreatorField',
    'CreatorField.line',
    'CreatorField.roles',
    'CreatorField.Person',
    'CreatorField.Orgunit',
    'CreatorField.Event'
  ]);

  /**
   * This custom input represents the creators of an entry. It is possible to
   * add several creators. Each creator is categorized by a name (string), a
   * role (huge external list) and a class ("Person", "Orgunit" or "Event").
   *
   * Data sample:
   * ************
   *
   *  > {
   *  >   labels: {
   *  >       en: "Authors",
   *  >       fr: "Auteurs"
   *  >   },
   *  >   multiple: true,
   *  >   property: "creators",
   *  >   required: true,
   *  >   type_ui: "CreatorField"
   *  > }
   */
  blf.modules.customInputs.CreatorField = function(obj, controller) {
    domino.module.call(this);

    var _dom,
        _lineID = 1,
        _linesHash = {},
        _classTemplates,
        _creatorRoles = blf.utils.extractMajors(controller.get('lists').creator_role || []),
        _creatorCountries = blf.utils.extractMajors(controller.get('lists').country || []),
        _creatorAffiliationPersonRoles = blf.utils.extractMajors(controller.get('lists').affiliation_role_person || []);

    _dom = $(blf.templates.get('CreatorField')({
      label: obj.label || obj.labels[controller.get('assets_lang')]
    }));

    // Add a line. The line is empty (ie to be filled by the user) if data is
    // not specified.
    function addCreator(data) {
      data = data || {};
      var id = _lineID++,
          li = $(blf.templates.get('CreatorField.line')({
            id: id,
            creators: _creatorRoles.map(function(o) {
              return o.separator ? {
                separator: true
              } : {
                type_id: o.type_id,
                label: o.label || o.labels[controller.get('assets_lang')]
              };
            })
          }));

      var agent = data.agent || {};
      if (data.roles)
        $('select.select-role', li).val(data.roles[0]);

      if (data.affiliation_role)
        $('select.select-affiliation-role', li).val(data.affiliation_role);

      _linesHash[id] = _classTemplates(agent.rec_class || 'Person');
      $('.custom-container', li).append(_linesHash[id].dom);

      if (agent.rec_class) {
        $('select.select-type', li).val(agent.rec_class);
        _linesHash[id].fill(data, _linesHash[id]);
      }

      $('ul.creators-list', _dom).append(li);
    }

    // Class templates:
    _classTemplates = function(c) {
      var o = {
        Person: {
          dom: $(blf.templates.get('CreatorField.Person')({
            affiliationRoles: _creatorAffiliationPersonRoles.map(function(o) {
              return o.separator ? {
                separator: true
              } : {
                type_id: o.type_id,
                label: o.label || o.labels[controller.get('assets_lang')]
              };
            })
          })),
          fill: function(data, obj) {
            obj.dom.data('id', data.agent.rec_id || null);

            $('input[data-attribute="name_prefix"]', obj.dom).val(data.agent.name_prefix);
            $('input[data-attribute="name_family"]', obj.dom).val(data.agent.name_family);
            $('input[data-attribute="name_given"]', obj.dom).val(data.agent.name_given);

            if (data.affiliation !== undefined)
              obj.dom.data('aff_id', data.affiliation.agent.rec_id || null);
              $('input[data-attribute="affiliation_name"]', obj.dom).val(((data.affiliation || {}).agent || {}).name);
              $('select.select-affiliation-role', obj.dom).val((data.affiliation || {}).role);

            return this;
          },
          getData: function(data, obj) {
            data.agent = data.agent || {
              rec_class: 'Person'
            };

            if (obj.dom.data('id'))
              data.agent.rec_id = obj.dom.data('id');

            data.agent.name_prefix = $('input[data-attribute="name_prefix"]', obj.dom).val() || undefined;
            data.agent.name_family = $('input[data-attribute="name_family"]', obj.dom).val() || undefined;
            data.agent.name_given = $('input[data-attribute="name_given"]', obj.dom).val() || undefined;

            var aff_name = $('input[data-attribute="affiliation_name"]', obj.dom).val();
            if (aff_name) {
              data.affiliation = {
                agent: {
                  rec_class: 'Orgunit',
                  name: aff_name
                }
              };
              var aff_role = $('select.select-affiliation-role', obj.dom).val();
              if (aff_role)
                data.affiliation.role = aff_role;
              if (obj.dom.data('aff_id'))
              data.affiliation.agent.rec_id = obj.dom.data('aff_id');
            }
            for (var k in data.agent)
              if (data.agent[k] === undefined)
                delete data.agent[k];

            return data;
          }
        },
        Orgunit: {
          dom: $(blf.templates.get('CreatorField.Orgunit')()),
          fill: function(data, obj) {
            obj.dom.data('id', data.agent.rec_id || null);

            $('input[data-attribute="name"]', obj.dom).val(data.agent.name);
            return this;
          },
          getData: function(data, obj) {
            data.agent = data.agent || {
              rec_class: 'Orgunit'
            };

            if (obj.dom.data('id'))
              data.agent.rec_id = obj.dom.data('id');

            data.agent.name = $('input[data-attribute="name"]', obj.dom).val() || undefined;

            for (var k in data.agent)
              if (data.agent[k] === undefined)
                delete data.agent[k];

            return data;
          }
        },
        Event: {
          dom: $(blf.templates.get('CreatorField.Event')({
            creatorCountries: _creatorCountries.map(function(o) {
              return o.separator ? {
                separator: true
              } : {
                type_id: o.type_id,
                label: o.label || o.labels[controller.get('assets_lang')]
              };
            })
          })),
          fill: function(data, obj) {
            obj.dom.data('id', data.agent.rec_id || null);

            $('input[data-attribute="title"]', obj.dom).val(data.agent.title);
            $('input[data-attribute="number"]', obj.dom).val(data.agent.number);
            $('input[data-attribute="place"]', obj.dom).val(data.agent.place);
            $('input[data-attribute="country"]', obj.dom).val(data.agent.country);
            $('input[data-attribute="date_begin"]', obj.dom).val(data.agent.date_begin);
            $('input[data-attribute="date_end"]', obj.dom).val(data.agent.date_end);
            $('input[data-attribute="international"]', obj.dom).attr('checked', data.agent.international ? 'checked' : null);
            if (data.agent.country !== undefined)
              $('select.select-event-country', obj.dom).val((data.agent || {}).country);
            return this;
          },
          getData: function(data, obj) {
            data.agent = data.agent || {
              rec_class: 'Event'
            };

            if (obj.dom.data('id'))
              data.agent.rec_id = obj.dom.data('id');

            data.agent.title = $('input[data-attribute="title"]', obj.dom).val() || undefined;
            data.agent.number = $('input[data-attribute="number"]', obj.dom).val() || undefined;
            data.agent.place = $('input[data-attribute="place"]', obj.dom).val() || undefined;
            data.agent.date_begin = $('input[data-attribute="date_begin"]', obj.dom).val() || undefined;
            data.agent.date_end = $('input[data-attribute="date_end"]', obj.dom).val() || undefined;
            data.agent.international = !!$('input[data-attribute="international"]', obj.dom).is(':checked');
            var event_country = $('select.select-event-country', obj.dom).val();
            if (event_country)
              data.agent.country = event_country;

            for (var k in data.agent)
              if (data.agent[k] === undefined)
                delete data.agent[k];

            return data;
          }
        }
      };

      return o[c];
    };

    // Bind events:
    $('.add-creator', _dom).click(function() {
      addCreator();
    });

    _dom.click(function(e) {
      var target = $(e.target),
          li = target.parents('ul.creators-list > li');

      // Check if it is a field button:
      if (li.length && target.is('.remove-creator')) {
        var id = li.data('id');
        li.remove();
        delete _linesHash[id];
      } else if (li.length && target.is('.moveup-creator')) {
        if (!li.is(':first-child'))
          li.prev().before(li);
      } else if (li.length && target.is('.movedown-creator')) {
        if (!li.is(':last-child'))
          li.next().after(li);
      }
    }).change(function(e) {
      var target = $(e.target),
          li = target.parents('ul.creators-list > li');

      // Check which select it is:
      if (li.length && target.is('select.select-type')) {
        var id = li.data('id'),
            value = target.val(),
            container = $('.custom-container', li);

        _linesHash[id] = _classTemplates(value);
        container.empty().append(_linesHash[id].dom);
      }
    });

    /**
     *  Check if the content of the component is valid. Returns true if valid,
     *  and false if not.
     *
     * @return {string} Returns true if the content id valid, and false else.
     */
    function _validate() {
      var data = _getData();

      if (obj.required && (!data || !data.length)) {
        $('.message', _dom).text(i18n.t('customInputs:CreatorField.errors.at_least_one'));
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
          ul = $('ul.creators-list', _dom).empty();

      // Parse data and create lines:
      (data || []).forEach(addCreator);
    }

    /**
     * Returns the well-formed data described by the component.
     *
     * @return {*} The data.
     */
    function _getData() {
      var creators = [];

      // Parse line and form data:
      $('ul.creators-list > li', _dom).each(function() {
        var li = $(this),
            id = li.data('id');

        creators.push(_linesHash[id].getData({
          roles: [$('select.select-role', li).val()]
        }, _linesHash[id]));
      });

      return creators.length ? creators : undefined;
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
    this.triggers.events.creatorRolesUpdated = function(d) {
      _creatorRoles = blf.utils.extractMajors(d.get('creatorRoles') || []);

      $('select.select-role', dom).html(
        _creatorRoles.map(function(o) {
          return blf.templates.get('CreatorField.roles')(o.separator ? {
            separator: true
          } : {
            type_id: o.type_id,
            label: o.label
          });
        })
      );
    };
  };
})();
