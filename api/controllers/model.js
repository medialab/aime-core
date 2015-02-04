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
    action: function(req, res) {
      book.getAll('en', function(err, result) {
        if (err) console.log(err);

        return res.ok(result);
      });
    }
  },
  {
    url: '/voc',
    action: function(req, res) {
      voc.getAll('en', function(err, result) {
        if (err) console.log(err);

        return res.ok(result);
      });
    }
  },
  {
    url: '/doc',
    action: function(req, res) {
      doc.getAll('en', function(err, result) {
        if (err) console.log(err);

        return res.ok(result);
      });
    }
  }
];
