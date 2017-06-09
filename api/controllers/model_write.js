/**
 * AIME-core Write Model Controller
 * =================================
 *
 * Collection of routes enabling to edit model data. Those routes should only
 * be accessible to users with enough clearance.
 */
var docModel = require('../model/document.js'),
    resModel = require('../model/resource.js'),
    scenarioModel = require('../model/scenario.js'),
    usersModel = require('../model/users.js');
    linkModel = require('../model/link.js');

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

  // Users
  {
    url: '/users',
    methods: ['GET'],
    action: function(req, res) {
      return usersModel.all(function(err, results) {
        if (err) res.serverError(err);

        return res.ok(results);
      });
    }
  },

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
        req.body.author,
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
        req.body.author,
        req.body.title || null,
        req.body.status,
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
      reference: '?string',
      url: '?url',
      file: '?dataUrl'
    },
    action: createResource('image')
  },
  {
    url: '/res/pdf',
    methods: ['POST'],
    validate: {
      reference: '?string',
      file: 'dataUrl'
    },
    action: createResource('pdf')
  },
  {
    url: '/res/quote',
    methods: ['POST'],
    validate: {
      text: 'string',
      reference: '?string'
    },
    action: createResource('quote')
  },
  {
    url: '/res/link',
    methods: ['POST'],
    validate: {
      url: 'url',
      reference: '?string',
      title: '?string'
    },
    action: createResource('link')
  },
  {
    url: '/res/video',
    methods: ['POST'],
    validate: {
      url: 'url',
      reference: '?string'
    },
    action: createResource('video')
  },
  {
    url: '/res/:id',
    methods: ['PUT'],
    action: function(req, res) {
      resModel.update(+req.params.id, req.lang, req.body, function(err, resource) {
        if (err) return res.serverError(err);
        return res.ok(resource);
      });
    }
  },
  {
    url: '/res/:id',
    methods: ['DELETE'],
    action: function(req, res) {
      resModel.destroy(+req.params.id, function(err, linkingDocuments) {
        if (err) return res.serverError(err);
        if (linkingDocuments.length === 0)
          return res.ok(linkingDocuments);
        else
          return res.forbidden(linkingDocuments);
      });
    }
  },

  // Scenarios
  {
    url: '/scenario',
    methods: ['POST'],
    validate: {
      title: 'string',
      items: 'array',
      modecross: 'string'
    },
    action: function(req, res) {
      scenarioModel.create(
        req.body.modecross,
        req.session.user,
        req.lang,
        req.body.title,
        req.body.items,
        function(err) {
          if (err) return res.serverError(err);

          return res.ok();
        }
      );
    }
  },

  {
    url: '/scenario/:id',
    methods: ['PUT'],
    validate: {
      title: '?string',
      items: '?array'
    },
    action: function(req, res) {
      if (!req.body.title && !req.body.items)
        return res.badRequest('Neither title or items is to be updated.');

      scenarioModel.update(
        +req.params.id,
        req.body.title,
        req.body.items,
        function(err) {
          if (err) return res.serverError(err);

          return res.ok();
        }
      );
    }
  },
  {
    url: '/scenario/:id',
    methods: ['DELETE'],
    action: function(req, res) {
      scenarioModel.destroy(+req.params.id, function(err) {
        if (err) return res.serverError(err);

        return res.ok();
      });
    }
  },
  // LINK
  {
    url: '/link',
    methods: ['POST'],
    validate: {
      idFrom: 'number',
      idTo: 'number',
      indexSentence: 'number'
    },
    action: function(req, res) {
      linkModel.create(
        req.body.idFrom,
        req.body.idTo,
        req.body.indexSentence,     
        req.session.user,
        function(err, markdown) {
          if (err){
            if (err.message === "linkDoesNotExists")
              return res.notFound();
            if (err.message === "linkExists")
              return res.forbidden("linkExists");
            return res.serverError(err);
          }
          return res.ok(markdown);
        }
      );
    }
  },
  {
    url: '/link',
    methods: ['DELETE'],
    validate: {
      idFrom: 'number',
      idTo: 'number',
      indexSentence: 'number'
    },
    action: function(req, res) {
      linkModel.destroy(
        req.body.idFrom,
        req.body.idTo,
        req.body.indexSentence,     
        req.session.user,
        function(err, markdown) {
          if (err){
            if (err.message === "linkDoesNotExists")
              return res.notFound();
            if (err.message === "linkExists")
              return res.forbidden("linkExists");
            return res.serverError(err);
          }
          return res.ok(markdown);
      });
    }
  }
];
