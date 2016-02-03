/**
 * AIME-core Diff Unit Tests
 * ==========================
 *
 */
var assert = require('assert'),
    diff = require('../../lib/diff.js');

describe('Diff', function() {

  it('#modecross', function() {
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
      assert.deepEqual(diff.modecross(pair[0], pair[1]), results[i]);
    });
  });

  it('#scenario', function() {
    var pairs = [
      [['bsc_12'], ['bsc_12']],
      [['bsc_12', 'doc_24'], ['bsc_12']],
      [['bsc_12'], ['doc_24', 'bsc_12']],
      [['bsc_12', 'voc_45'], ['doc_24', 'bsc_12']],
      [['doc_24', 'bsc_12'], ['bsc_12', 'doc_24']]
    ];

    var results = [
      {additions: [], deletions: []},
      {additions: [], deletions: ['doc_24']},
      {additions: ['doc_24'], deletions: []},
      {additions: ['doc_24'], deletions: ['voc_45']},
      {additions: [], deletions: []}
    ];

    pairs.forEach(function(pair, i) {
      assert.deepEqual(diff.scenario(pair[0], pair[1]), results[i]);
    });
  });
});
