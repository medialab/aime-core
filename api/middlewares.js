/**
 * AIME-core Generic Middlewares
 * ==============================
 *
 * Compilation of middlewares used throughout the express application.
 */
var types = require('./typology.js'),
    cache = require('./cache.js'),
    config = require('../config.json').api,
    accept = require('accept-language'),
    _ = require('lodash');

accept.languages(['en', 'fr']);

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

  // Verify whether the user is admin or not
  admin: function(req, res, next) {
    var user = (req.session.user || {});

    if (!req.session.authenticated || user.role !== 'admin')
      return res.unauthorized();
    else
      return next();
  },

  // Checking cache before anything
  cache: function(name) {
    return function(req, res, next) {
      var lang = req.lang,
          target = cache[lang][name],
          limit = req.query.limit,
          offset = req.query.offset || 0,
          data;

      if (target) {
        if (!limit)
          data = target.slice(offset);
        else
          data = _.take(target.slice(offset), limit);

        return res.ok(data);
      }
      else if (!limit && !offset) {
        res.cache = true;
        res.on('finish', function() {
          cache[lang][name] = res.cache;
          res.cache = null;
        });
      }

      return next();
    };
  },

  // Cleaning the cache
  cleanCache: function(req, res, next) {
    ['en', 'fr'].forEach(function(lang) {
      ['book', 'vocabulary', 'documents', 'resources'].forEach(function(k) {
        cache[lang][k] = null;
      });
    });

    return next();
  },

  // Checking request language
  language: function(req, res, next) {

    // If session has a language
    if (req.session.lang) {
      req.lang = req.session.lang;
      return next();
    }

    // Trying to assert it form the headers
    var header = req.headers['accept-language'];

    if (header)
      req.lang = accept.get(header) || config.defaultLang;
    else
      req.lang = config.defaultLang;

    return next();
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
