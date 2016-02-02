/**
 * AIME-core Modecross Parser Unit Tests
 * ======================================
 *
 */
var assert = require('assert'),
    parser = require('../../lib/modecross_parser.js');

describe('Modecross parser', function() {

  it('should correctly find modecross occurrences.', function() {

    var texts = [
      'This has no modecross.',
      'This is [POL] mode.',
      'This is [POL].\nBut multiline [REF].',
      'This has twice [POL] and [POL]',
      'This has [POL] and [REF-LAW]'
    ];

    // TODO: norm, lang translation, keep only good ones etc.

    var parsed = [
      [],
      ['POL'],
      ['POL', 'REF'],
      ['POL'],
      ['POL', 'REF-LAW']
    ];

    texts.forEach(function(text, i) {
      assert.deepEqual(parser(text), parsed[i]);
    });
  });
});
