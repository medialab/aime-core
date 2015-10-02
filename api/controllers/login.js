/**
 * AIME-core Login Controller
 * ===========================
 *
 * Log users in or out. Nothing too impressive.
 */
var model = require('../model/users.js'),
    bookmarks = require('../model/bookmark.js'),
    postman = require('../postman.js'),
    _ = require('lodash');

module.exports = [

  // Retrieve session info
  {
    url: '/session',
    action: function(req, res) {
      if (!req.session.user) {
        return res.ok({lang: req.lang});
      }
      else {
        return bookmarks.get(req.session.user.id, function(err, results) {
          if (err) return res.serverError(err);
          return res.ok({
            lang: req.lang,
            user: req.session.user,
            bookmarks: results
          });
        });
      }
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
        if (/already exists.*email/.test(err.message)) return res.badRequest('duplicateEmail');
        if (err) return res.serverError(err);

        // Sending the mail
        postman.registration(req.lang, user.email, user.token, function(err, info) {
          if (err) return res.serverError(err);

          return res.json(user);
        });
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

      return model.authenticate(email, req.body.password, function(err, user) {
        if (err) return res.serverError(err);
        if (!user) return res.forbidden();

        // Storing user session
        req.session.lang = req.lang;
        req.session.user = user;
        req.session.authenticated = true;

        return bookmarks.get(user.id, function(err, result) {
          if (err) return res.serverError(err);
          return res.ok(_.merge({}, user, {bookmarks: result}));
        });
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
  },

  // Request a password change
  {
    url: '/sos',
    validate: {
      email: 'string'
    },
    methods: ['POST'],
    action: function(req, res) {
      return model.sos(req.body.email, function(err, token) {
        if (err) return res.serverError(err);
        if (!token) return res.notFound();

        return postman.reset(req.lang, req.body.email, token, function(err, info) {
          if (err) return res.serverError(err);

          return res.ok({token: token});
        });
      });
    }
  },

  {
    url: '/reactivate/:token',
    validate: {
      password: 'string'
    },
    methods: ['POST'],
    action: function(req, res) {

      // find the user, if he exists, update the password
    }
  }
];
