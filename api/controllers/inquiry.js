/**
 * AIME-core Inquiry Controller
 * =============================
 *
 * Collection of routes used by the inquiry interface specifically.
 */
var misc = require('../model/misc.js');

module.exports = [
  {
    url: '/inquiry/search/:query',
    validate: {
      query: 'string'
    },
    action: function(req, res) {
      misc.inquirySearch(req.params.query, function(err, ids) {
        if (err) return res.serverError(err);

        return res.ok({book: ids});
      });
    }
  }
];
