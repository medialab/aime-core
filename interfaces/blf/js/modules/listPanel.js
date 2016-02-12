;(function() {
  'use strict';

  mlab.pkg('blf.modules');

  /**
   * The list panel, to display a list of entries abstracts.
   */
  blf.modules.listPanel = function(html) {
    domino.module.call(this);

    var _list,
        _listIndex,
        _self = this,
        _html = html;

    _html.click(function(e) {
      var entryId,
          target = $(e.target),
          li = target.parents('ul > li');

      if (li.length && target.is('.delete-entry')) {
        entryId = li.attr('data-id');

        _self.dispatchEvent('deleteEntry', {
          rec_id: entryId
        });
        e.stopPropagation();
        return false;
      } else if (li.length && target.is('.edit-entry')) {
        entryId = li.attr('data-id');

        _self.dispatchEvent('editEntry', {
          entryId: entryId,
          entry: _listIndex[entryId]
        });
        e.stopPropagation();
        return false;
      }
    });

    function restart() {
      $('> ul', _html).empty();
    }

    function fill(d) {
      restart();

      var fields = d.get('availableFields'),
          ul = $('> ul', _html).empty();

      _list.forEach(function(o) {
        var editable = fields[o.rec_type];

        ul.append(
          '<li data-id="' + o.rec_id + '">' +
            '<div class="buttons-container">' +
              // '<button class="delete-entry">-</button>' +
              (editable ? '<button class="edit-entry">edit</button>' : '') +
            '</div>' +
            '<span class="entry-type">(' + o.rec_type + ')</span> ' +
            '<span class="entry-title" title="' + o.title + '">' + o.title + '</span>' +
          '</li>'
        );
      });
    }

    /**
     * DOMINO BINDINGS:
     * ****************
     */
    // Listen to the controller:
    this.triggers.events.modeUpdated = function(d) {
      if (d.get('mode') !== 'list')
        restart();
    };

    // Display a list of abstracts:
    this.triggers.events.resultsListUpdated = function(d) {
      _list = d.get('resultsList');
      _listIndex = mlab.array.index(_list, 'rec_id');
      fill(d);
    };
  };
})();
