/**
 * AIME-core Reconciler Unit Tests
 * ================================
 *
 */
var assert = require('assert'),
    reconciler = require('../../lib/reconciler.js');

describe('Reconciler', function() {
  var text = {
    padding: {
      type: 'paragraph',
      text: 'Padding'
    },
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

  var bookmarks = {
    one: {index: 0, id: 1},
    two: {index: 1, id: 2},
    three: {index: 2, id: 3}
  };

  it('should properly reconcile bookmarks.', function() {
    var cases = [

      // Identical
      {
        bookmarks: [bookmarks.two],
        beforeItems: [text.hello, text.goodbye],
        afterItems: [text.hello, text.goodbye],
        operations: []
      },

      // Fuzzy same place
      {
        bookmarks: [bookmarks.two],
        beforeItems: [text.padding, text.hello, text.goodbye],
        afterItems: [text.padding, text.alteredHello, text.goodbye],
        operations: [{type: 'rewire', target: text.alteredHello, bookmark: bookmarks.two}]
      },

      // Fuzzy different place
      {
        bookmarks: [bookmarks.one],
        beforeItems: [text.hello, text.goodbye],
        afterItems: [text.goodbye, text.alteredHello],
        operations: [{type: 'rewire', target: text.alteredHello, bookmark: bookmarks.one}]
      },

      // Force same place
      {
        bookmarks: [bookmarks.two],
        beforeItems: [text.hello, text.goodbye],
        afterItems: [text.hello, text.padding],
        operations: [{type: 'rewire', target: text.padding, bookmark: bookmarks.two}]
      },

      // Force first item
      {
        bookmarks: [bookmarks.two],
        beforeItems: [text.hello, text.goodbye],
        afterItems: [text.hello],
        operations: [{type: 'rewire', target: text.hello, bookmark: bookmarks.two}]
      },

      // Wiped
      {
        bookmarks: [bookmarks.three],
        beforeItems: [text.padding, text.hello, text.goodbye],
        afterItems: [],
        operations: [{type: 'drop', bookmark: bookmarks.three}]
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
