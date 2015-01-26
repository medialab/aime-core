/**
 * AIME-core Tokenizer Unit Tests
 * ===============================
 *
 */
var assert = require('assert'),
    tokenizer = require('../../lib/tokenizer.js');

describe('Tokenizer', function() {

  it('should be possible to tokenize simple sentences.', function() {
    assert.deepEqual(
      tokenizer('Hello, my liege. How dost thou fare?'),
      ['Hello, my liege.', 'How dost thou fare?']
    );
  });

  it('should be possible to tokenize multi-line.', function() {
    assert.deepEqual(
      tokenizer('Hello, my liege.\nHow dost thou fare?'),
      ['Hello, my liege.', 'How dost thou fare?']
    );
  });

  it('should be possible to tokenize ...', function() {
    assert.deepEqual(
      tokenizer('Hello, my liege... How dost thou fare?'),
      ['Hello, my liege...', 'How dost thou fare?']
    );
  });

  it('should be possible to catch abbreviations.', function() {
    assert.deepEqual(
      tokenizer('Hello, my liege. How dost thou fare? How about your N.A.T.O. hearings? It was fine!'),
      ['Hello, my liege.', 'How dost thou fare?', 'How about your N.A.T.O. hearings?', 'It was fine!']
    );
  });

  it('should catch common exceptions.', function() {
    assert.deepEqual(
      tokenizer('Hello Mr. Salinger. Nice weather, no?'),
      ['Hello Mr. Salinger.', 'Nice weather, no?']
    );
  });

  it('should be possible to pass your own exceptions.', function() {
    assert.deepEqual(
      tokenizer('How about Msgr. Casoli? I heard he\'s not that good.', ['Msgr']),
      ['How about Msgr. Casoli?', 'I heard he\'s not that good.']
    );
  });

  it('should be possible to detect the quote traps.', function() {
    assert.deepEqual(
      tokenizer('He said "my horse is fine." Did he really?'),
      ['He said "my horse is fine."', 'Did he really?']
    );
  });

  it('should be possible to recompose blocks that are inside quotation marks.', function() {
    assert.deepEqual(
      tokenizer('He said "this. is.my. Horse" and nay. What can I do?'),
      ['He said "this. is.my. Horse" and nay.', 'What can I do?']
    );
  });

  it('should be possible to deal with a most complex case.', function() {
    assert.deepEqual(
      tokenizer('He said "this. is not. My horse." What can I do?'),
      ['He said "this. is not. My horse."', 'What can I do?']
    );
  });

  it('should work with a real-life example.', function() {
    assert.deepEqual(
      tokenizer('So I seek no justification other than a lovely image from Souriau: the colors of the Lascaux cave are quite simply those that the painter found underfoot; “yellow ochre, red ochre; green clay, black smoke. He has to make do.” To adopt a horse.'),
      [
        'So I seek no justification other than a lovely image from Souriau: the colors of the Lascaux cave are quite simply those that the painter found underfoot; “yellow ochre, red ochre; green clay, black smoke. He has to make do.”',
        'To adopt a horse.'
      ]
    );
  });

  it('should handle proclitics.', function() {
    assert.deepEqual(
      tokenizer('\'Tis a fine lad? No. \'Twas a fine lad... Ok!'),
      ['\'Tis a fine lad?', 'No.', '\'Twas a fine lad...', 'Ok!']
    );
  });

  it('should work when some edge cases are positioned at the end of the text.', function() {
    assert.deepEqual(
      tokenizer('Hello. This is Mr.'),
      ['Hello.', 'This is Mr.']
    );

    assert.deepEqual(
      tokenizer('Hello. I am a "falsy string.'),
      ['Hello.', 'I am a "falsy string.']
    );
  });
});
