/**
 * AIME-core Generic Middlewares
 * ==============================
 *
 * Compilation of middlewares used throughout the express application.
 */
var types = require('typology'),
    cache = require('./cache.js'),
    config = require('../config.json').api;

// Helpers
function param(req, key) {
  if (key in req.body)
    return req.body[key];
  if (key in req.query)
    return req.query[key];
  if (key in req.params)
    return req.params[key];
};

// Export
module.exports = {

  // Verify the user's authentication before proceeding
  authenticate: function(req, res, next) {
    if (!req.session.authenticated)
      return res.unauthorized();
    else
      return next();
  },

  // Checking cache before anything
  cache: function(name) {
    return function(req, res, next) {
      var lang = req.params.lang || config.defaultLang;

      if (cache[lang][name])
        return res.ok(cache[lang][name]);
      else {
        res.cache = true;
        res.on('finish', function() {
          cache[lang][name] = res.cache;
          res.cache = null;
        });
        return next();
      }
    };
  },

  // Checking the given method so we can return a 405 if needed
  checkMethod: function(allowed) {
    return function(req, res, next) {
      if (!~allowed.indexOf(req.method))
        return res.wrongMethod(allowed, req.method);
      else
        return next();
    }
  },

  // Validate the parameters of the query
  validate: function(def) {
    return function(req, res, next) {

      // Retrieving params
      var data = {};
      for (var k in def)
        data[k] = param(req, k);

      // Validating params
      try {
        types.check(data, def, true);
      }
      catch (e) {
        return res.badRequest(e, def);
      }

      return next();
    };
  }
};
