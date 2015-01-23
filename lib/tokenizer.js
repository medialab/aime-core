/**
 * AIME-core Sentence Tokenizer
 * =============================
 *
 * Breaking raw text into sentences without lookbehinds...
 */

// NOTE: the lookahead should be sharpened
var REGEX = new RegExp([
  "([.?!]+)",
    "(?:[\\s\\r\\n]+)",
  "(?=\"?[A-Z])"
].join(''), 'g');

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

function tokenize(s, exceptions) {
  var initialTokens = s.replace(REGEX, '$1\x1E').split('\x1E'),
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

  var memo = '';
  for (i = 0, l = initialTokens.length; i < l; i++) {
    if (~initialTokens[i].search(new RegExp(exceptionsRegex))) {
      memo += initialTokens[i];
    }
    else {
      correctTokens.push(memo + (memo ? ' ' : '') + initialTokens[i]);
      memo = '';
    }
  }

  return correctTokens;
}

// Exporting
module.exports = tokenize;
