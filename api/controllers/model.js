/**
 * AIME-core Model Controller
 * ===========================
 *
 * Defining the application routes able to return the inquiry's data.
 */
var bookModel = require('../model/book.js'),
    vocModel = require('../model/vocabulary.js'),
    docModel = require('../model/document.js'),
    resModel = require('../model/resource.js'),
    types = require('../typology.js'),
    _ = require('lodash');

// Forge
function getAll(model) {
  return function(req, res) {
    var params = _.extend({}, req.query, {user_id: req.session.user.id});

    model.getAll(req.lang, params, function(err, result) {
      if (err) return res.serverError(err);

      return res.ok(result);
    });
  };
}

function search(model) {
  return function(req, res) {
    model.search(req.session.user, req.lang, req.params.query, function(err, ids) {
      if (err) return res.serverError(err);

      return res.ok(ids);
    });
  };
}

function getByIds(model) {
  return function(req, res) {
    var ids = _.uniq(req.params.ids.split(',')),
        method;

    if (types.check(ids, 'ids'))
      method = 'getByIds';
    else if (types.check(ids, 'slugs'))
      method = 'getBySlugIds';
    else
      return res.badRequest(
        'Wrong ids.',
        'List of ids or slug ids separated by commas.'
      );

    model[method](ids, function(err, vocs) {
      if (err) return res.serverError(err);

      return res.ok(vocs);
    });
  };
}

function getRelated(model) {
  return function(req, res) {
    var modecross = req.params.modecross;

    model.getByModecross(req.lang, modecross, function(err, result) {
      if (err) return res.serverError(err);

      return res.ok(result);
    });
  };
}

// Refactor model access by forge
module.exports = [

  // Book
  {
    url: '/book',
    cache: 'book',
    action: getAll(bookModel)
  },
  {
    url: '/book/search/:query',
    validate: {
      query: 'string'
    },
    action: search(bookModel)
  },
  {
    url: '/book/related/:modecross',
    validate: {
      modecross: 'modecross'
    },
    action: getRelated(bookModel)
  },

  // Vocabulary
  {
    url: '/voc',
    validate: {
      limit: '?integer',
      offset: '?integer'
    },
    cache: 'vocabulary',
    action: getAll(vocModel)
  },
  {
    url: '/voc/:ids',
    action: getByIds(vocModel)
  },
  {
    url: '/voc/search/:query',
    validate: {
      query: 'string'
    },
    action: search(vocModel)
  },
  {
    url: '/voc/related/:modecross',
    validate: {
      modecross: 'modecross'
    },
    action: getRelated(vocModel)
  },

  // Documents
  {
    url: '/doc',
    validate: {
      limit: '?integer',
      offset: '?integer'
    },
    cache: 'documents',
    action: getAll(docModel)
  },
  {
    url: '/doc/:ids',
    action: getByIds(docModel)
  },
  {
    url: '/doc/search/:query',
    validate: {
      query: 'string'
    },
    action: search(docModel)
  },
  {
    url: '/doc/related/:modecross',
    validate: {
      modecross: 'modecross'
    },
    action: getRelated(docModel)
  },

  // Resource
  {
    url: '/res',
    cache: 'resources',
    action: getAll(resModel)
  }
];
