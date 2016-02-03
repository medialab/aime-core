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
      'This has twice [POL] and [POL].',
      'This has [POL] and [REF-LAW].',
      'This has a [DRO] French mode and [NET-POL] crossing.',
      'This has a [REL·POL] middot.',
      'This is not a valid [TAR] mode.'
    ];

    var parsed = [
      [],
      ['POL'],
      ['POL', 'REF'],
      ['POL'],
      ['POL', 'REF-DRO'],
      ['DRO', 'RES-POL'],
      ['REL-POL'],
      []
    ];

    texts.forEach(function(text, i) {
      assert.deepEqual(parser(text), parsed[i], text);
    });
  });
});
