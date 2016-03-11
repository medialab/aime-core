/**
 * AIME-core Reconciler Unit Tests
 * ================================
 *
 */
var assert = require('assert'),
    reconciler = require('../../lib/reconciler.js');

describe('Reconciler', function() {
  var text = {
    hello: {
      type: 'paragraph',
      text: 'Hello World!'
    },
    goodbye: {
      type: 'paragraph',
      text: 'Goodbye World!'
    },
    alteredHello: {
      type: 'paragraph',
      text: 'Hello World?'
    }
  };

  var medias = {
    quote: {
      type: 'quote',
      id: 1
    },
    image: {
      type: 'image',
      id: 2
    }
  };

  it('should properly reconcile bookmarks.', function() {
    var cases = [
      {
        bookmarks: [{index: 1, id: 1}],
        beforeItems: [text.hello, text.goodbye],
        afterItems: [text.hello, text.goodbye],
        operations: []
      }
    ];

    cases.forEach(function(c, i) {
      assert.deepEqual(
        reconciler(c.bookmarks, c.beforeItems, c.afterItems),
        c.operations,
        'Case n°' + i
      );
    });
  });
});
