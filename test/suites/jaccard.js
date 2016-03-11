/**
 * AIME-core Jaccard Unit Tests
 * =============================
 *
 */
var assert = require('assert'),
    jaccard = require('../../lib/jaccard.js');

describe('Jaccard', function() {

  it('should compute jaccard similarity correctly.', function() {
    var tests = [
      ['context', 'contact', 4 / 7],
      ['context', 'context', 1],
      ['abc', 'def', 0],
      ['', '', 1]
    ];

    tests.forEach(function(test) {
      assert.strictEqual(
        jaccard(test[0], test[1]),
        test[2],
        'Testing "' + test[0] + '" and "' + test[1] + '".'
      );
    });
  });
});
