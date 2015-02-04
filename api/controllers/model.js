/**
 * AIME-core Model Controller
 * ===========================
 *
 * Defining the application routes able to return the inquiry's data.
 */
var model = require('../model/book.js');

module.exports = [
  {
    url: '/book',
    action: function(req, res) {
      model.book('en', function(err, book) {
        if (err) console.log(err);

        return res.ok(book);
      });
    }
  }
];
