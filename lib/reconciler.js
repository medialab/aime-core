/**
 * AIME-core Bookmark Reconciler
 * ==============================
 *
 * Function able to reconcile users' bookmarks when editing the structure of
 * a document.
 */
var levenshtein = require('talisman/metrics/levenshtein').default,
    _ = require('lodash');

var THRESHOLD = 0.8;

/**
 * Normalized Levenshtein (dividing by the length of the longest sequence).
 */
function normalizedLevenshtein(a, b) {
  return 1 - (levenshtein(a, b) / Math.max(a.length, b.length, 1));
}

/**
 * Rationale:
 *
 * 1. Check the element of same index. If identical => keep bookmark.
 * 2. Check every elements w/ Jaccard. If correct one => rewire.
 * 3. Rewire on the element of same index if it exists.
 * 4. Rewire on the first item if it exists.
 * 5. Delete bookmark.
 *
 * Note:
 *
 * Will handle only text since media nodes won't be affected.
 */
module.exports = function reconciler(bookmarks, beforeItems, afterItems) {
  var operations = [];

  bookmarks.forEach(function(bookmark) {
    var before = beforeItems[bookmark.index],
        after = afterItems[bookmark.index];

    // 1-
    if (after && (before.text === after.text))
      return operations.push({type: 'rewire', target: after, bookmark: bookmark});

    // 2-
    if (before.type === 'paragraph') {
      var similar = _.find(afterItems, function(item) {
        return item.type === 'paragraph' &&
               normalizedLevenshtein(item.text, before.text) >= THRESHOLD;
      });

      if (similar)
        return operations.push({type: 'rewire', target: similar, bookmark: bookmark});
    }

    // 3-
    if (after)
      return operations.push({type: 'rewire', target: after, bookmark: bookmark});

    // 4-
    if (afterItems[0])
      return operations.push({type: 'rewire', target: afterItems[0], bookmark: bookmark});

    // 5-
    return operations.push({type: 'drop', bookmark: bookmark});
  });

  return operations;
};
