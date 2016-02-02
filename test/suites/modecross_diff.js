/**
 * AIME-core Modecross Diff Unit Tests
 * ====================================
 *
 */
var assert = require('assert'),
    diff = require('../../lib/modecross_diff.js');

describe('Modecross diff', function() {

  it('should correctly find differences between sets of modecross.', function() {

    // TODO: handle different ordering

    var pairs = [
      [['POL'], ['POL']],
      [['POL', 'REF'], ['POL']],
      [['POL'], ['REF', 'POL']],
      [['POL', 'LAW'], ['REF', 'POL']],
      [['REF-POL'], ['POL-REF']]
    ];

    var results = [
      {additions: [], deletions: []},
      {additions: [], deletions: ['REF']},
      {additions: ['REF'], deletions: []},
      {additions: ['REF'], deletions: ['LAW']},
      {additions: [], deletions: []}
    ];

    pairs.forEach(function(pair, i) {
      assert.deepEqual(diff(pair[0], pair[1]), results[i]);
    });
  });
});
