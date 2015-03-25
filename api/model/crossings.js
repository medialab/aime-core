/**
 * AIME-core Document Model
 * =========================
 *
 */
var db = require('../connection.js'),
    queries = require('../queries.js').crossings,
    async = require('async'),
    slugs = require('../../config.json').api.slugs,
    models = {
      book: require('./book.js'),
      doc: require('./document.js'),
      voc: require('./vocabulary.js')
    },
    _ = require('lodash');

module.exports = {
  getInfo: function(lang, callback) {
    db.rows(queries.getInfo, {lang: lang}, function(err, results) {
      if (err) return callback(err);

      return callback(null, {
        modes: _.indexBy(results[0], 'name'),
        cross: _.indexBy(results[1], 'name'),
        maxCount: {
          modes: _.max(results[0], 'count').count,
          cross: _.max(results[1], 'count').count
        }
      });
    });
  },
  getTiles: function(lang, callback) {
    db.rows(queries.tiles, {lang: lang}, function(err, result) {
      if (err) return callback(err);

      return callback(null, result.map(function(e) {
        return {
          title: slugs[e.type] + '- ' + e.title
        };
      }));
    });
  },
  getRelatedToModecross: function(lang, modecross, callback) {
    async.parallel({
      info: function(next) {
        db.rows(queries.modecross, {name: modecross, lang: lang}, function(err, result) {
          if (err) return next(err);

          return next(null, result[0]);
        });
      },
      doc: function(next) {
        models.doc.getByModecross(lang, modecross, next);
      },
      voc: function(next) {
        models.voc.getByModecross(lang, modecross, next);
      },
      book: function(next) {
        models.book.getByModecross(lang, modecross, next);
      }
    }, function(err, results) {
      if (err) return callback(err);

      // Treating data to conform it to crossings interface's desires
      var data = {
        current: {},
        related: [],
        scenars: []
      };

      // Current key
      data.current.type = results.info.type === 'mode' ?
        'Vocabulary_Mode' :
        'Vocubulary_Cross';

      data.current.id = slugs.vocabulary + '_' + results.info.slug_id;
      data.current.lang = lang;
      data.current.modecross = results.info.name;

      data.current.paragraphs = results.info.paragraphs.map(function(p) {
        return {
          text: p.text
        };
      });

      // TODO: questions

      // Scenars
      data.scenars = results.info.scenars.map(function(s) {
        return {
          lang: lang,
          modecross: results.info.name,
          name: s.scenario.title,
          status: 'published',
          items: s.items.map(function(i) {
            return slugs[i.type] + '_' + i.slug_id;
          })
        };
      });

      // Related elements
      data.related = results.doc
        .concat(results.voc)
        .concat(results.book);

      return callback(null, data);
    });
  }
};
