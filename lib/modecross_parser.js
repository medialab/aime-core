/**
 * AIME-core ModeCross Parser
 * ==========================
 *
 * Simple regex parser used to detect occurrences of modes & crossings within
 * the given text.
 */
var REGEX = /\[([A-Za-z]{2,3}(?:[·-][A-Za-z]{2,3})?)\]/g,
    _ = require('lodash');

function multimatch(regex, string) {
  var matches = [],
      match;

  while (match = regex.exec(string))
    matches.push(match);

  regex.lastIndex = 0;

  return matches;
}


module.exports = function parser(text) {
  var matches = multimatch(REGEX, text);

  return _(matches)
    .map(1)
    .uniq()
    .sortBy()
    .value();
};
