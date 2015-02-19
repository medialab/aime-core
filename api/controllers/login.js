/**
 * AIME-core Login Controller
 * ===========================
 *
 * Log users in or out. Nothing too impressive.
 */
var model = require('../model/users.js');

module.exports = [

  // Retrieve session info
  {
    url: '/session',
    action: function(req, res) {
      return res.ok({
        lang: req.lang,
        user: req.session.user
      });
    }
  },

  // Register
  {
    url: '/register',
    validate: {
      email: 'string',
      password: 'string',
      name: 'string',
      surname: 'string',
      institution: '?string',
      department: '?string',
      discipline: '?string',
      interest: '?string',
      avatar: '?string'
    },
    methods: ['POST'],
    action: function(req, res) {
      model.create(req.body, function(err, user) {
        if (err) return res.serverError(err);

        return res.json(user);
      });
    }
  },

  // Activate a user
  {
    url: '/activate/:token',
    validate: {
      token: 'string'
    },
    methods: ['POST'],
    action: function(req, res) {
      model.activate(req.params.token, function(err, user) {
        if (err) return res.serverError(err);

        if (!user) {
          return res.notFound();
        }
        else {

          // Storing user session
          req.session.lang = req.lang;
          req.session.user = user;
          req.session.authenticated = true;

          return res.ok(user);
        }
      });
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
      var email = req.body.email;

      model.authenticate(email, req.body.password, function(err, user) {
        if (err) return res.serverError(err);
        if (!user) return res.forbidden();

        // Storing user session
        req.session.lang = req.lang;
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
  },

  // Request for password retrieval
  {
    url: '/retrieve/:id',
    validate: {
      id: 'string'
    },
    methods: ['POST'],
    action: function(req, res) {
      var userId = +req.params.id;

      model.createResetToken(userId, function(err, token) {
        if (err) return res.serverError(err);

        if (!token)
          return res.notFound();
        else
          return res.ok(token);
      });
    }
  },

  // Reset a user password
  {
    url: '/reset',
    validate: {
      token: 'string'
    },
    methods: ['POST'],
    action: function(req, res) {
      return res.notImplemented();
    }
  },

  // Change the session's lang
  {
    url: '/lang/:lang',
    validate: {
      lang: 'lang'
    },
    methods: ['POST'],
    action: function(req, res) {
      if (!req.session) {
        return res.unauthorized();
      }
      else {
        req.session.lang = req.params.lang;
        return res.ok({lang: req.params.lang});
      }
    }
  }
];
