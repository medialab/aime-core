/**
 * AIME-core Model Controller
 * ===========================
 *
 * Defining the application routes able to return the inquiry's data.
 */
var book = require('../model/book.js'),
    voc = require('../model/vocabulary.js'),
    doc = require('../model/document.js'),
    res = require('../model/resource.js'),
    types = require('../typology.js'),
    _ = require('lodash');

// Forge
function getAll(model) {
  return function(req, res) {
    model.getAll(req.lang, req.query, function(err, result) {
      if (err) return res.serverError(err);

      return res.ok(result);
    });
  };
}

function search(model) {
  return function(req, res) {
    model.search(req.lang, req.params.query, function(err, ids) {
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
    action: getAll(book)
  },
  {
    url: '/book/search/:query',
    validate: {
      query: 'string'
    },
    action: search(book)
  },
  {
    url: '/book/related/:modecross',
    validate: {
      modecross: 'modecross'
    },
    action: getRelated(book)
  },

  // Vocabulary
  {
    url: '/voc',
    validate: {
      limit: '?integer',
      offset: '?integer'
    },
    cache: 'vocabulary',
    action: getAll(voc)
  },
  {
    url: '/voc/:ids',
    action: getByIds(voc)
  },
  {
    url: '/voc/search/:query',
    validate: {
      query: 'string'
    },
    action: search(voc)
  },
  {
    url: '/voc/related/:modecross',
    validate: {
      modecross: 'modecross'
    },
    action: getRelated(voc)
  },

  // Documents
  {
    url: '/doc',
    validate: {
      limit: '?integer',
      offset: '?integer'
    },
    cache: 'documents',
    action: getAll(doc)
  },
  {
    url: '/doc/:ids',
    action: getByIds(doc)
  },
  {
    url: '/doc/search/:query',
    validate: {
      query: 'string'
    },
    action: search(doc)
  },
  {
    url: '/doc/related/:modecross',
    validate: {
      modecross: 'modecross'
    },
    action: getRelated(doc)
  },
  {
    url: '/doc',
    methods: ['POST'],
    validate: {
      title: 'string',
      slides: '?string'
    },
    action: function(req, res) {
      return doc.create(
        req.session.user,
        req.lang,
        req.body.title,
        req.body.slides || '',
        function(err, doc) {
          if (err) return res.serverError(err);

          return res.ok(doc);
        }
      );
    }
  },
  {
    url: '/doc/:id',
    methods: ['PUT'],
    validate: {
      title: '?string',
      slides: '?string'
    },
    action: function(req, res) {
      return doc.update(
        +req.params.id,
        req.body.title || null,
        req.body.slides || '',
        function(err, doc) {
          if (err && err.message === 'not-found') return res.notFound();
          if (err) return res.serverError(err);

          return res.ok(doc);
        }
      );
    }
  },
  {
    url: '/doc/:id',
    methods: ['DELETE'],
    action: function(req, res) {
      return doc.destroy(+req.params.id, function(err, doc) {
        if (err && err.message === 'not-found') return res.notFound();
        if (err) return res.serverError(err);

        return res.ok(doc);
      });
    }
  },

  // Resource
  {
    url: '/res',
    cache: 'resources',
    action: getAll(res)
  },
  {
    url: '/res',
    methods: ['POST'],
    action: function(req, res) {
      return res.notImplemented();
    }
  },
  {
    url: '/res/:id',
    methods: ['PUT'],
    action: function(req, res) {
      return res.notImplemented();
    }
  },
  {
    url: '/res/:id',
    methods: ['DELETE'],
    action: function(req, res) {
      return res.notImplemented();
    }
  }
];
