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

var MAX = 290;
function truncate(str) {
  return _.trunc(str, {
    length: MAX,
    omission: ' [...]',
    separator: ' '
  });
}

function submatches(r, t) {
  var m = [];

  while (match = r.exec(t)) {
    m.push(match[1]);
  }

  return m;
}

function questionTokenizer(txt) {
  var qm = submatches(/\s\d\)\s*([^?]+\?)/g, txt),
      am = submatches(/\?\s?(.*?)(?:\s\d\)|$)/g, txt);

  return qm.map(function(qme, i) {
    return {
      question: qme,
      answer: am[i]
    };
  });
}

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

      var questions = _(results.info.paragraphs.slice(1))
        .map(function(p) {
          return questionTokenizer(p.text);
        })
        .flatten()
        .value();

      // Current key
      data.current = {
        cat: results.info.type === 'mode' ? 'Vocabulary_Mode' : 'Vocubulary_Cross',
        id: slugs.vocabulary + '_' + results.info.slug_id,
        lang: lang,
        modecross: results.info.name,
        paragraphs: results.info.paragraphs.map(function(p) {
          return {
            text: p.text
          };
        }),
        thumbnail: {
          type: 'txt',
          content: truncate(results.info.paragraphs[0].text)
        },
        title: '[' + modecross.replace('-', '·') + ']',
        questions: [
          {answer: results.info.paragraphs[0].text, question: 'description'},
        ].concat(questions)
      };

      // TODO: questions

      // Scenars
      data.scenars = results.info.scenars.map(function(s) {
        return {
          lang: lang,
          modecross: results.info.name,
          name: s.scenario.title,
          id: 'test',
          status: 'published',
          items: s.items.map(function(i) {
            return slugs[i.type] + '_' + i.slug_id;
          })
        };
      });

      // Related elements
      // NOTE: should be ordered likewise:
      //  -- Contributions
      //  -- Documents
      //  -- Vocabulary
      //  -- Subheadings

      // data.related = results.doc
      //   .concat(results.voc)
      //   .concat(results.book);

      var bookRelated = results.book.map(function(b) {
        return {
          cat: 'bsc',
          choosen : true,
          title: b.title,
          id: slugs[b.type] + '_' + b.slug_id,
          index: b.index,
          origin: 'inquiry_platform',
          parentindex: b.parent.display_number,
          parenttitle: b.parent.title,
          paragraphs: b.children.map(function(p, i) {
            return {
              index: i,
              text: p.text
            };
          }),
          thumbnail: {
            type: 'txt',
            content: truncate(b.children[0].text)
          }
        }
      });

      data.related = data.related
        .concat(bookRelated);

      data.related = data.related.map(function(item, i) {
        item.order = i;
        item.i = i;
        return item;
      });

      return callback(null, data);
    });
  }
};
