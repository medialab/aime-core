/**
 * AIME-core Markdown Stripper Unit Tests
 * =======================================
 *
 */
var assert = require('assert'),
    stripper = require('../../lib/markdown_stripper.js');

describe('Markdown Stripper', function() {
  it('should work as expected.', function() {
    var markdown = '[This](link) is a **link** I find *very* interesting{doc_34}.';

    assert.strictEqual(
      stripper(markdown),
      'This is a link I find very interesting.'
    );
  });
});
