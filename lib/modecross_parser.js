/**
 * AIME-core ModeCross Parser
 * ==========================
 *
 * Simple regex parser used to detect occurrences of modes & crossings within
 * the given text.
 */
var _ = require('lodash');

/**
 * Constants
 */
var REGEX = /\[([A-Za-z]{2,3}(?:[•·-][A-Za-z]{2,3})?)\]/g;

var MODES = [
  'REP',
  'MET',
  'HAB',
  'TEC',
  'FIC',
  'REF',
  'POL',
  'DRO',
  'REL',
  'ATT',
  'ORG',
  'MOR',
  'RES',
  'PRE',
  'DC'
];

MODES = MODES.reduce(function(index, mode) {
  index[mode] = true;
  return index;
}, {});

/**
 * Helpers
 */
function multimatch(regex, string) {
  var matches = [],
      match;

  while (match = regex.exec(string))
    matches.push(match);

  regex.lastIndex = 0;

  return matches;
}

function translate(modecross) {
  return modecross
    .replace(/NET/, 'RES')
    .replace(/LAW/, 'DRO');
}

function isValid(modecross) {
  return modecross.split('-').every(function(mode) {
    return !!MODES[mode];
  });
}

/**
 * Main
 */
module.exports = function parser(text) {
  var matches = multimatch(REGEX, text);

  return _(matches)
    .map(function(match) {
      return match[1];
    })
    .uniq()
    .sortBy()
    .map(function(modecross) {
      return translate(modecross.replace(/[•·]/g, '-'));
    })
    .filter(isValid)
    .value();
};
