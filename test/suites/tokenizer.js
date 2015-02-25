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

    assert.deepEqual(
      tokenizer('No, what interests our investigator about Church history is that in it the continual fluctuations in the very relation between these two questions—which she has still not managed to bring together—can be clearly seen. The multiple gaps between network, value, domain, and institution are not only her problem, as an uninformed observer, but the problem that her informants themselves confront constantly, explicitly, consciously. Whether it is a question of St. Paul’s “invention” of Christianity, St. Francis’s monastic renewal, Luther’s Reform (I almost said St. Luther), each case features the relation between an aging, impotent institution and the necessary renewal that allows that institution to remain fundamentally faithful to its origins while undergoing huge transformations. And each case calls for judgment; in each case, the researcher has to make a fresh start, cast the fruitfulness of the renewal into doubt, go back to the beginning, reconsider and redistribute all the elements that had been renewed . . . Or else.'),
      [
        'No, what interests our investigator about Church history is that in it the continual fluctuations in the very relation between these two questions—which she has still not managed to bring together—can be clearly seen.',
        'The multiple gaps between network, value, domain, and institution are not only her problem, as an uninformed observer, but the problem that her informants themselves confront constantly, explicitly, consciously.',
        'Whether it is a question of St. Paul’s “invention” of Christianity, St. Francis’s monastic renewal, Luther’s Reform (I almost said St. Luther), each case features the relation between an aging, impotent institution and the necessary renewal that allows that institution to remain fundamentally faithful to its origins while undergoing huge transformations.',
        'And each case calls for judgment; in each case, the researcher has to make a fresh start, cast the fruitfulness of the renewal into doubt, go back to the beginning, reconsider and redistribute all the elements that had been renewed . . .',
        'Or else.'
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

  it('should work with silly characters such as … .', function() {
    assert.deepEqual(
      tokenizer('Hello horse… What do you do?'),
      ['Hello horse…', 'What do you do?']
    );
  });

  it('should handle parenthesis.', function() {
    assert.deepEqual(
      tokenizer('Hello (horse). What is your name?'),
      ['Hello (horse).', 'What is your name?']
    );

    assert.deepEqual(
      tokenizer('Hello (First item. Second item). So?'),
      ['Hello (First item. Second item).', 'So?']
    );

    assert.deepEqual(
      tokenizer('Hello {First item. Second item}. So?'),
      ['Hello {First item. Second item}.', 'So?']
    );

    assert.deepEqual(
      tokenizer('Hello my liege (doc_45). What about you?'),
      ['Hello my liege (doc_45).', 'What about you?']
    );

    assert.deepEqual(
      tokenizer('Hello my liege {doc_45}. What about you?'),
      ['Hello my liege {doc_45}.', 'What about you?']
    );
  });

  it('should handle some markdown cases.', function() {
    assert.deepEqual(
      tokenizer('Hello, this is *horse.* What now?'),
      ['Hello, this is *horse.*', 'What now?']
    );

    assert.deepEqual(
      tokenizer('Hello, this is **horse.** What now?'),
      ['Hello, this is **horse.**', 'What now?']
    );

    assert.deepEqual(
      tokenizer('Hello, this is _horse._ What now?'),
      ['Hello, this is _horse._', 'What now?']
    );

    assert.deepEqual(
      tokenizer('Hello, this is __horse.__ What now?'),
      ['Hello, this is __horse.__', 'What now?']
    );
  });

  it('should handle weirdos.', function() {

    assert.deepEqual(
      tokenizer('How on earth {did this happen}? Horse? Anyone?'),
      ['How on earth {did this happen}?', 'Horse?', 'Anyone?']
    );
  });

  it('should be possible to start a sentence with a number.', function() {
    assert.deepEqual(
      tokenizer('1) We are going to do this. 2) We are going to do that.'),
      ['1) We are going to do this.', '2) We are going to do that.']
    );

    assert.deepEqual(
      tokenizer('1. We are going to do this. 2. We are going to do that.'),
      ['1. We are going to do this.', '2. We are going to do that.']
    );

    assert.deepEqual(
      tokenizer('A) We are going to do this. B) We are going to do that.'),
      ['A) We are going to do this.', 'B) We are going to do that.']
    );

    assert.deepEqual(
      tokenizer('A. We are going to do this. B. We are going to do that.'),
      ['A. We are going to do this.', 'B. We are going to do that.']
    );
  });
});
