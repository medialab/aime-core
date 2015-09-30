/**
 * AIME-core Bookmark Controller
 * ==============================
 *
 * Route enabling the user to retrieve and/or post bookmark related data.
 */
var model = require('../model/bookmark.js');

module.exports = [
  {
    url: '/notebook',
    methods: ['GET'],
    action: function(req, res) {
      return res.notImplemented();
    }
  },
  {
    url: 'bookmark/:id',
    methods: ['POST'],
    validate: {
      id: 'number'
    },
    action: function(req, res) {
      model.create(req.session.user.id, req.params.id, function(err) {
        if (err) return res.serverError(err);
        return res.ok();
      });
    }
  },
  {
    url: 'bookmark/:id',
    methods: ['DELETE'],
    validate: {
      id: 'number'
    },
    action: function(req, res) {
      model.destroy(req.session.user.id, req.params.id, function(err) {
        if (err) return res.serverError(err);
        return res.ok();
      });
    }
  }
];