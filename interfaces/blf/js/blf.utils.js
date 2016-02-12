;(function() {
  'use strict';

  // Handlebars helpers:
  Handlebars.registerHelper('t', function(i18n_key) {
    var result = i18n.t(i18n_key);
    return new Handlebars.SafeString(result);
  });

  Handlebars.registerHelper('ifCond', function(v1, operator, v2, options) {
    switch (operator) {
      case '==':
        return (v1 == v2) ? options.fn(this) : options.inverse(this);
      case '===':
        return (v1 === v2) ? options.fn(this) : options.inverse(this);
      case '<':
        return (v1 < v2) ? options.fn(this) : options.inverse(this);
      case '<=':
        return (v1 <= v2) ? options.fn(this) : options.inverse(this);
      case '>':
        return (v1 > v2) ? options.fn(this) : options.inverse(this);
      case '>=':
        return (v1 >= v2) ? options.fn(this) : options.inverse(this);
      default:
        return options.inverse(this);
    }
  });

  // Templates management:
  mlab.pkg('blf.templates.preloaded');
  (function() {
    var _templates = {},
        _override = {},
        _prefix = 'templates/',
        _suffix = '.handlebars';

    function loadTemplate(path, callback) {
      if (!blf.templates.get(path))
        $.ajax({
          url: _prefix + path + _suffix,
          success: function(data) {
            _templates[path] = Handlebars.compile(data);
            if (callback)
              callback(_templates[path]);
          }
        });
      else if (callback)
        callback(blf.templates.get(path));
    }

    blf.templates.require = function(v, callback) {
      if (typeof v === 'string')
        loadTemplate(v, callback);
      else
        for (var k in v)
          loadTemplate(v[k]);
    };

    blf.templates.get = function(path) {
      return(
        // First, check overrides:
        _override[path] ||
        // Then, check preloaded templates:
        blf.templates.preloaded[_prefix + path + _suffix] ||
        // If nothing has been found, check dynamic templates:
        _templates[path]
      );
    };

    blf.templates.override = function(name, template) {
      _override[name] = template;
    };
  })();

  // Some specific utils:
  mlab.pkg('blf.utils');
  blf.utils.translateLabels = function(obj, lang) {
    var k,
        i,
        l,
        res = {};

    obj = obj;
    if (domino.struct.check('object', obj))
      for (k in obj) {
        if (k === 'labels')
          res.label = obj[k][lang];
        else if (domino.struct.check('array', obj[k]))
          res[k] = obj[k].map(function(val) {
            return blf.utils.translateLabels(val, lang);
          });
        else if (domino.struct.check('object', obj[k]))
          res[k] = blf.utils.translateLabels(obj[k], lang);
        else
          res[k] = obj[k];
      }
    else if (domino.struct.check('array', obj))
      res = obj.map(function(val) {
        return blf.utils.translateLabels(val, lang);
      });
    else
      res = obj;

    return res;
  };
  blf.utils.extractMajors = function(array) {
    var defaults = [],
        majors = [],
        others = [];

    function filter(a, b) {
      if (a.label < b.label)
        return -1;
      if (a.label > b.label)
        return 1;
      return 0;
    }

    array.forEach(function(o) {
      if (o.default)
        defaults.push(o);
      else if (o.major)
        majors.push(o);
      else if (!o.deprecated)
        others.push(o);
    });

    if (majors.length) {
      if (others.length)
        others = [{ separator: true }].concat(others);

      others = majors.concat(others);
    }

    if (defaults.length) {
      if (others.length)
        others = [{ separator: true }].concat(others);

      others = defaults.concat(others);
    }

    return others;
  };
})();
