/**
 * AIME-core Sentence Tokenizer
 * =============================
 *
 * Breaking raw text into sentences without lookbehinds...
 */

var EXCEPTIONS = [
  'Mr',
  'Mrs',
  'Ms',
  'Mme',
  'Mlle',
  'Jr',
  'Dr',
  'Prof',
  'Sr',
  'Mgr',
  'etc'
];

var QUOTES = '«»„‟“”"\'’‘`‛';

// NOTE: the lookahead should be sharpened
var REGEX = new RegExp([
  "([.?!]+)",
    "([" + QUOTES + "]?)",
    "[\\s\\r\\n]+",
  "(?=[" + QUOTES + "]?[A-Z])"
].join(''), 'g');

function tokenize(s, exceptions) {
  var initialTokens = s.replace(REGEX, '$1$2\x1E').split('\x1E'),
      correctTokens = [],
      i,
      l;

  var exceptionsRegex =
    '(' +
    EXCEPTIONS
      .concat(exceptions)
      .map(function(e) {
        return e + '\\.';
      })
      .join('|') +
    ')$';

  var memo = '',
      c;
  for (i = 0, l = initialTokens.length; i < l; i++) {
    c = initialTokens[i];

    // Searching for an exception
    if (~c.search(new RegExp(exceptionsRegex))) {
      memo += c;
      continue;
    }

    correctTokens.push(memo + (memo ? ' ' : '') + c);
    memo = '';
  }

  return correctTokens;
}

// Exporting
module.exports = tokenize;
