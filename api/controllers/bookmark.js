/**
 * AIME-core Bookmark Controller
 * ==============================
 *
 * Route enabling the user to retrieve and/or post bookmark related data.
 */
var model = require('../model/bookmark.js');

module.exports = [
  {
    url: '/',
    methods: ['GET'],
    action: function(req, res) {
      return res.notImplemented();
    }
  },
  {
    url: '/',
    methods: ['POST'],
    validate: {
      id: 'number'
    },
    action: function(req, res) {
      return res.notImplemented();
    }
  }
];
