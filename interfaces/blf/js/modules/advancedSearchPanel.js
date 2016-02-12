;(function() {
  'use strict';
  mlab.pkg('blf.modules');

  // Loading Handlebars templates:
  blf.templates.require([
    'advancedSearchPanel',
    'advancedSearchPanel.index'
  ]);

  /**
   * The advanced search panel.
   */
  blf.modules.advancedSearchPanel = function(html, controller) {
    domino.module.call(this);

    var _self = this,
        _html = html,
        _config = blf.utils.translateLabels(
          controller.get('config').advancedSearchPanel || {},
          controller.get('assets_lang')
        ),
        _index = _config.index,
        _filter = _config.filters,
        _filtersComponents;

    _html.append($(blf.templates.get('advancedSearchPanel')()));

    // Try to get the list:
    // AAARGH: How am I supposed to do when I add a module that needs to
    //         dispatch an event when bindings are actually not existing yet?
    //         So... here is one dirty solution, waiting for something cleaner:
    //
    //         => https://github.com/jacomyal/domino.js/issues/35
    window.setTimeout(function() {
      [
        _index.property_source_index,
        _index.property_source_operator
      ].forEach(function(v) {
        if (v)
          _self.dispatchEvent('loadList', {
            list: v
          });
      });
    }, 0);

    // Bind DOM events:
    _html.on('click', '.add-index', function() {
      _index.indexesArray = getIndexesArray().concat({
        index: _index.indexes[0].type_id,
        value: '',
        operator: _index.default_operator
      });
      generateIndex();
    }).on('click', '.remove-index', function(e) {
      _index.indexesArray.splice(
        $(e.target).closest('.index').index(),
        1
      );
      generateIndex();
    }).on('click', '.validate-advanced-search', function(e) {
      _self.dispatchEvent('search', {
        query: getQuery()
      });
    });

    restart();

    function getIndexesArray() {
      var res = [];
      $('.index', _html).each(function() {
        var self = $(this);
        res.push({
          index: $('[data-type="index"]', self).val(),
          value: $('[data-type="value"]', self).val(),
          operator: $('[data-type="operator"]', self).val()
        });
      });

      return res;
    }

    function getQuery() {
      var i,
          l,
          k,
          value,
          component,
          query = {};

      // Index:
      query.search_terms = getIndexesArray().filter(function(o) {
        return o.value;
      });

      // Filter:
      for (i = 0, l = _filtersComponents.length; i < l; i++) {
        component = _filtersComponents[i];
        value = blf.modules.createPanel.getData(component, query);

        if (value !== undefined && component.property !== undefined)
          query[component.property] = value;
      }

      return query;
    }

    // Generate index DOM:
    function generateIndex() {
      var dom = $('.index-container', _html).empty();

      if (_index)
        dom.append($(blf.templates.get('advancedSearchPanel.index')(_index)));
    }

    // Regenerate everything blabla:
    function restart() {
      _index.indexesArray = _index.default_index.map(function(v) {
        return typeof v === 'string' ?
          {
            index: v,
            value: '',
            operator: _index.default_operator
          } :
          v;
      });

      _filtersComponents = blf.modules.createPanel.generateForm(
        controller,
        _filter
      ).components;
      $('.filter-container', _html).empty().append(_filtersComponents.map(function(o) {
        return o.dom;
      }));

      generateIndex();
    }

    this.triggers.events.listsUpdated = function(controller) {
      if (_index) {
        var indexes = controller.get('lists')[_index.property_source_index],
            operators = controller.get('lists')[_index.property_source_operator];

        if (!_index.indexes && indexes) {
          _index.indexes = indexes;
          generateIndex();
        }

        if (!_index.operators && operators) {
          _index.operators = operators;
          generateIndex();
        }
      }
    };
    this.triggers.events.modeUpdated = function(d) {
      if (d.get('mode') !== 'advancedSearch')
        restart();
    };

    // Initialize lists:
    this.triggers.events.listsUpdated(controller);
  };
})();
