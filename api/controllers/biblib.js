/**
 * AIME-core Biblib Controller
 * ============================
 *
 * Route enabling the administrator to retrieve reference list from biblib
 */
var model = require('../model/biblib.js'),
    conf = require('../../config.json').biblib;

module.exports = [
  {
    url: '/',
    methods: ['GET'],
    action: function(req, res) {

      model.search(function(err, list) {
        if (err) return res.serverError(err);
        return res.ok(list);
      });

      // return res.ok("list");
    }
  }
];
