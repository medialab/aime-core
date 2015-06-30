/**
 * AIME-core URL Shortener
 * ========================
 *
 * Utility used mostly by the crossings interface to provide users with
 * human-readable URLs leading to the inquiry's items.
 */
module.exports = [
  {
    url: '/:model/:id',
    action: function(req, res) {

      // TODO: decide whether it's possible to keep the original ids or not!
      return res.notImplemented();
    }
  }
];
