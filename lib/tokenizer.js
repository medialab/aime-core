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

var QUOTES = '«»„‟“”"',
    SIMPLE_QUOTES = '’‘`‛\'';

var REGEX = new RegExp([
  "([.?!…]+)",
    "([" + QUOTES + "]?)",
    "[\\s\\r\\n]+",
  "(?=[" + QUOTES + SIMPLE_QUOTES + "]?[A-Z])"
].join(''), 'g');

var QUOTE_REGEX = new RegExp('[' + QUOTES + ']', 'g');

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

    // Searching for exceptions
    if (i !== l - 1 &&
        ((~c.search(new RegExp(exceptionsRegex))) ||
         (((memo + c).match(QUOTE_REGEX) || []).length % 2 !== 0))) {
      memo += c;
      continue;
    }

    correctTokens.push(memo + (c && memo ? ' ' : '') + c);
    memo = '';
  }

  return correctTokens;
}

// Exporting
module.exports = tokenize;
