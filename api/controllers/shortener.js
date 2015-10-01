/**
 * AIME-core URL Shortener
 * ========================
 *
 * Utility used mostly by the crossings interface to provide users with
 * human-readable URLs leading to the inquiry's items.
 */
var db = require('../connection.js'),
    queries = require('../queries.js').misc,
    inquiryHost = require('../../config.json').interfaces.inquiry.replace(/\/$/, ''),
    _ = require('lodash');

var TYPES = {
  bsc: 'subheading',
  voc: 'vocabulary',
  doc: 'document'
};

var HASHES = {
  voc: '#a=SET+VOC+LEADER&c[leading]=VOC&c[slave]=TEXT&i[id]=#vocab-<%= id %>&i[column]=VOC&s=0',
  doc: '#a=SET+DOC+LEADER&c[leading]=DOC&c[slave]=TEXT&i[id]=#doc-<%= id %>&i[column]=DOC&s=0'
};

for (var k in HASHES)
  HASHES[k] = _.template(HASHES[k]);

module.exports = [
  {
    url: '/:model/:slug_id',
    validate: {
      model: 'model'
    },
    action: function(req, res) {
      var model = req.params.model,
          slugId = +req.params.slug_id,
          type = TYPES[model];

      // Checking whether said element exists
      return db.query(queries.exists, {slug_id: slugId, type: type}, function(err, result) {
        if (err) return res.serverError(err);
        if (!result.length) return res.notFound();

        // Switching lang
        req.session.lang = result[0].lang;

        // Redirecting
        return res.redirect(inquiryHost + '/' + HASHES[model]({id: slugId}));
      });
    }
  },
  {
    url: '/:lang/voc/:modecross',
    validate: {
      lang: 'lang',
      modecross: 'modecross'
    },
    action: function(req, res) {
      var lang = req.params.lang,
          modecross = req.params.modecross;

      // Retrieving the correct vocabulary
      return db.query(queries.getModecrossVoc, {modecross: modecross, lang: lang}, function(err, result) {
        if (err) return res.serverError(err);
        if (!result.length) return res.notFound();

        // Switching lang
        req.session.lang = lang;

        // Redirecting
        return res.redirect(inquiryHost + '/' + HASHES.voc({id: result[0].slug_id}));
      });
    }
  },
  {
    url: '/ime/:lang/:model/:legacy_id',
    validate: {
      lang: 'lang',
      model: 'model'
    },
    action: function(req, res) {
      return res.notImplemented();
    }
  }
];
