/**
 * AIME-core Write Model Controller
 * =================================
 *
 * Collection of routes enabling to edit model data. Those routes should only
 * be accessible to users with enough clearance.
 */
var docModel = require('../model/document.js'),
    resModel = require('../model/resource.js'),
    types = require('../typology.js'),
    _ = require('lodash');

// Forge
function createResource(kind) {
  return function(req, res) {
    resModel.create(kind, req.lang, req.body, function(err, resource) {
      if (err) return res.serverError(err);
      return res.ok(resource);
    });
  };
}

module.exports = [

  // Documents
  {
    url: '/doc',
    methods: ['POST'],
    validate: {
      title: 'string',
      slides: '?string'
    },
    action: function(req, res) {
      return docModel.create(
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
      return docModel.update(
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
      return docModel.destroy(+req.params.id, function(err, doc) {
        if (err && err.message === 'not-found') return res.notFound();
        if (err) return res.serverError(err);

        return res.ok(doc);
      });
    }
  },

  // Resources
  {
    url: '/res/image',
    methods: ['POST'],
    validate: {
      reference: '?bibtex|string',
      url: '?url'
    },
    action: createResource('image')
  },
  {
    url: '/res/quote',
    methods: ['POST'],
    validate: {
      text: 'string',
      reference: '?bibtex|string'
    },
    action: createResource('quote')
  },
  {
    url: '/res/link',
    methods: ['POST'],
    validate: {
      url: 'url',
      reference: '?bibtex|string',
      title: '?string'
    },
    action: createResource('link')
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
