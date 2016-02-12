;(function() {
  'use strict';

  mlab.pkg('blf.modules.customInputs');

  blf.modules.fieldsPanel = function(html) {
    domino.module.call(this);

    var _self = this,
        _html = html,
        _fields = {};

    // Bind DOM events:
    $('.select-field', _html).click(function(e) {
      var dom = $(e.target);

      // Check if it is a field anchor:
      if (dom.is('a[data-field]')) {
        _self.dispatchEvent('openField', {
          field: dom.attr('data-field')
        });

        e.stopPropagation();
        return false;
      }
    });

    /**
     * DOMINO BINDINGS:
     * ****************
     */
    // Listen to the controller:
    this.triggers.events.fieldsTreeUpdated = function(d) {
      var dom,
          tree = d.get('fieldsTree');

      // Generate the HTML to select which field to use:
      dom = (function recursiveParse(node, depth) {
        var header =
          (node.label && !node.bundle && !node.deprecated) ?
            '<a href="#" data-field="' + node.type_id + '">' +
              node.label +
            '</a>' :
            node.label ?
              '<span>' + node.label + '</span>' :
              '';

        return header +
          ((node.children || []).length ?
            '<ul class="tree-depth-' + depth + '">' +
              node.children.map(function(obj) {
                return(
                  '<li>' +
                    recursiveParse(obj, depth + 1) +
                  '</li>'
                );
              }).join('') +
            '</ul>' :
            '');
      })(tree, 0);

      // Add the HTML to the DOM:
      $('.select-field', _html).empty().append(dom);
    };
  };
})();
