/**
 * AIME-core Biblib Controller
 * ============================
 *
 * Route enabling the administrator to retrieve reference list from biblib
 */
var model = require('../model/biblib.js'),
    resource = require('../model/resource.js');

module.exports = [
  {
    url: '/',
    methods: ['GET'],
    action: function(req, res) {
      model.search(function(err, list) {
        if (err) return res.serverError(err);
        return res.ok(list);
      });
    }
  },
  {
    url: '/replicate/:id',
    methods: ['POST'],
    action: function(req, res) {
      var id = +req.params.id;

      return resource.replicate(id, function(err, relevant) {
        if (err) return res.serverError(err);
        if (!relevant) return res.notFound();
        return res.ok();
      });
    }
  }
];
