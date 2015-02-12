/**
 * AIME-core Login Controller
 * ===========================
 *
 * Log users in or out. Nothing too impressive.
 */
var model = require('../model/users.js');

module.exports = [

  // Register
  {
    url: '/register',
    validate: {
      email: 'string',
      password: 'string'
    },
    methods: ['POST'],
    action: function(req, res) {

    }
  },

  // Log a user into the system
  {
    url: '/login',
    validate: {
      email: 'string',
      password: 'string'
    },
    methods: ['POST'],
    action: function(req, res) {
      var email = req.param('email');

      model.authenticate(email, req.param('password'), function(err, user) {
        if (err) return res.serverError(err);
        if (!user) return res.forbidden();

        // Storing user sessions
        req.session.user = user;
        req.session.authenticated = true;

        return res.ok(user);
      });
    }
  },

  // Log a user out of the system
  {
    url: '/logout',
    methods: ['GET', 'POST'],
    action: function(req, res) {

      // Deleting session
      delete req.session.user;
      delete req.session.authenticated;

      return res.ok();
    }
  }
];
