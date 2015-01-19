/**
 * AIME-core Login Controller
 * ===========================
 *
 * Log users in or out. Nothing too impressive.
 */
var model = require('../model/users.js');

module.exports = [
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
  }
];
