/**
 * AIME-core Model Controller
 * ===========================
 *
 * Defining the application routes able to return the inquiry's data.
 */
var book = require('../model/book.js'),
    voc = require('../model/vocabulary.js'),
    doc = require('../model/document.js'),
    types = require('../typology.js'),
    _ = require('lodash');

// Refactor model access by forge
module.exports = [
  {
    url: '/book',
    cache: 'book',
    action: function(req, res) {
      book.getAll(req.lang, function(err, result) {
        if (err) return res.serverError(err);

        return res.ok(result);
      });
    }
  },
  {
    url: '/book/search/:query',
    validate: {
      query: 'string'
    },
    action: function(req, res) {
      book.search(req.lang, req.params.query, function(err, ids) {
        if (err) return res.serverError(err);

        return res.ok(ids);
      });
    }
  },
  {
    url: '/voc',
    validate: {
      limit: '?integer',
      offset: '?integer'
    },
    cache: 'vocabulary',
    action: function(req, res) {
      voc.getAll(req.lang, req.query, function(err, result) {
        if (err) return res.serverError(err);

        return res.ok(result);
      });
    }
  },
  {
    url: '/voc/:ids',
    action: function(req, res) {
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

      voc[method](ids, function(err, vocs) {
        if (err) return res.serverError(err);

        return res.ok(vocs);
      });
    }
  },
  {
    url: '/voc/search/:query',
    validate: {
      query: 'string'
    },
    action: function(req, res) {
      voc.search(req.lang, req.params.query, function(err, vocs) {
        if (err) return res.serverError(err);

        return res.ok(vocs);
      });
    }
  },
  {
    url: '/doc',
    validate: {
      limit: '?integer',
      offset: '?integer'
    },
    cache: 'documents',
    action: function(req, res) {
      doc.getAll(req.lang, req.query, function(err, result) {
        if (err) return res.serverError(err);

        return res.ok(result);
      });
    }
  },
  {
    url: '/doc/:ids',
    action: function(req, res) {
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

      doc[method](ids, function(err, vocs) {
        if (err) return res.serverError(err);

        return res.ok(vocs);
      });
    }
  },
  {
    url: '/doc/search/:query',
    validate: {
      query: 'string'
    },
    action: function(req, res) {
      doc.search(req.lang, req.params.query, function(err, vocs) {
        if (err) return res.serverError(err);

        return res.ok(vocs);
      });
    }
  }
];
