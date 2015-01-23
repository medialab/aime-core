/**
 * AIME-core Sentence Tokenizer
 * =============================
 *
 * Breaking raw text into sentences without lookbehinds...
 */
var REGEX = new RegExp([
  "([a-z0-9\"'\\)\\]\\}][.?!]{1,3})",
    "\\s|\\r\\n",
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
  var initialTokens = s.replace(REGEX, '$1λλ').split('λλ'),
      correctTokens = [],
      i,
      l;

  var exceptionsRegex =
    '(' +
    EXCEPTIONS
      .concat(exceptions)
      .map(function(e) { return e + '\\.'; })
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
