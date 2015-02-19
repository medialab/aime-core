/**
 * AIME-core Model Controller
 * ===========================
 *
 * Defining the application routes able to return the inquiry's data.
 */
var book = require('../model/book.js'),
    voc = require('../model/vocabulary.js'),
    doc = require('../model/document.js');

module.exports = [
  {
    url: '/book',
    cache: 'book',
    action: function(req, res) {
      book.getAll('en', function(err, result) {
        if (err) return res.serverError(err);

        return res.ok(result);
      });
    }
  },
  {
    url: '/voc',
    cache: 'vocabulary',
    action: function(req, res) {
      voc.getAll('en', function(err, result) {
        if (err) return res.serverError(err);

        return res.ok(result);
      });
    }
  },
  {
    url: '/voc/:ids',
    action: function(req, res) {
      var ids = req.params.ids.split(','),
          slugged = !!~ids[0].indexOf('_');

      voc[slugged ? 'getBySlugIds' : 'getByIds'](req.params.ids.split(','), 'en', function(err, vocs) {
        if (err) return res.serverError(err);

        return res.ok(vocs.length > 1 ? vocs : vocs[0]);
      });
    }
  },
  {
    url: '/doc',
    cache: 'documents',
    action: function(req, res) {
      doc.getAll('en', function(err, result) {
        if (err) return res.serverError(err);

        return res.ok(result);
      });
    }
  }
];
