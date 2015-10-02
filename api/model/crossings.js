/**
 * AIME-core Document Model
 * =========================
 *
 */
var db = require('../connection.js'),
    queries = require('../queries.js').crossings,
    async = require('async'),
    slugs = require('../../config.json').api.slugs,
    types = require('../typology.js'),
    models = {
      book: require('./book.js'),
      doc: require('./document.js'),
      voc: require('./vocabulary.js')
    },
    _ = require('lodash');

/**
 * Helpers
 */
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
  var qm = submatches(/\s\w\)\s*([^?:]+[?:])/g, txt),
      am = submatches(/[?:]\s?(.*?)(?:\s\w\)|$)/g, txt);

  return qm.map(function(qme, i) {
    return {
      question: qme,
      answer: am[i]
    };
  });
}

function formatDate(date) {
  var y = date.slice(0, 4),
      m = date.slice(4, 6),
      j = date.slice(6, 8);

  return (new Date(y, m, j).toISOString())
}

function getDocumentThumbnail(doc) {
  var candidates = [];

  // Iterating through slides
  doc.children.forEach(function(slide) {

    // Iterating through slide's elements
    slide.children.forEach(function(element) {

      // In case of text
      if (element.type === 'paragraph')
        candidates.push({
          type: 'txt',
          content: truncate(element.text)
        });

      // In case of quote
      if (element.kind === 'quote' && !candidates.length)
        candidates.unshift({
          type: 'cit',
          content: truncate(element.text)
        });

      // In case of reference
      if (element.type === 'reference')
        candidates.push({
          type: 'bib',
          content: truncate(element.text || element.biblib_id)
        });

      // In case of image
      if (element.kind === 'image')
        candidates.unshift({
          type: 'img',
          internal: element.internal,
          content: element.path || element.url
        });

      // In case of vimeo
      if (element.kind === 'video' && element.host === 'vimeo')
        candidates.unshift({
          type: 'vimeo',
          content: element.identifier
        });

      // In case of pdf
      if (element.kind === 'pdf')
        candidates.push({
          type: 'txt',
          content: truncate(element.path)
        });
    });
  });

  return candidates[0];
}

/**
 * Model
 */
module.exports = {
  getInfo: function(lang, callback) {
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

      // Handling cases like MET-PRE with no paragraphs
      results.info = results.info || {
        paragraphs: [{text: '', question: 'description'}],
        scenars: []
      };

      var questions = _(results.info.paragraphs.slice(1))
        .map(function(p){
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

      // Scenars
      data.scenars = results.info.scenars.map(function(s, i) {
        return {
          lang: lang,
          modecross: results.info.name,
          name: s.scenario.title,
          _id: '' + i,
          sid: '' + i,
          status: 'published',
          items: s.items.map(function(i) {
            return slugs[i.type] + '_' + i.slug_id;
          })
        };
      });

      // Related elements
      // NOTE: should be ordered likewise:

      //  -- Documents & Contributions
      var docRelated = results.doc.map(function(d) {

        var slides = d.children.map(function(slide) {
          var refs = [],
              i = 0;

          var medias = slide.children.map(function(element, j) {

            // Additionnal reference
            if (element.reference) {
              var reference = element.reference;

              refs.push([j, {
                type: 'bib',
                content: reference.html || reference.text,
                pindex: -1
              }]);
            }

            if (element.type === 'paragraph')
              return {
                type: 'txt',
                content: element.text,
                pindex: ++i
              };

            if (element.type === 'reference')
              return {
                type: 'bib',
                content: element.html || element.text,
                pindex: -1
              };

            if (element.kind === 'image')
              return {
                type: 'img',
                internal: element.internal,
                content: element.path || element.url,
                pindex: -1,
                lightboxcontent: {
                  content: element.path || element.url,
                  internal: element.internal,
                  ref: element.reference && element.reference.text
                }
              };

            if (element.kind === 'video' && element.host === 'vimeo')
              return {
                type: 'vimeo',
                content_id: element.identifier,
                pindex: -1
              };

            if (element.kind === 'video')
              return {
                type: 'video',
                iframe: element.html,
                pindex: -1
              };

            if (element.kind === 'quote')
              return {
                type: 'cit',
                content: element.text,
                pindex: ++i
              };

            if (element.kind === 'pdf')
              return {
                type: 'pdf',
                path: element.path,
                content_id: element.title,
                pindex: -1
              };

            if (element.kind === 'link') {
              return {
                type: 'link',
                html: element.html,
                pindex: -1
              };
            }
          });

          refs.forEach(function(r) {
            var i = r[0],
                ref = r[1];

            medias = medias.slice(0, i + 1).concat(r[1]).concat(medias.slice(i + 1));
          });

          // DIRTY: dropping null values probably originating from bad cypher
          return {
            medias: _.compact(medias)
          };
        });

        return {
          cat: d.original ? 'doc' : 'cont',
          author: {
            name: d.author.name + ' ' + d.author.surname
          },
          original: d.original,
          choosen: true,
          date: formatDate(d.date),
          id: slugs[d.type] + '_' + d.slug_id,
          lang: d.lang,
          status: d.status,
          title: d.title,
          thumbnail: getDocumentThumbnail(d),
          slides: slides,
          slides_medias_flattened: _(slides).map('medias').flatten().value()
        };
      });

      //  -- Vocabulary
      var vocRelated = results.voc.map(function(v) {
        var mc = types.check(v.title, 'modecross');

        var cat = mc ?
          (types.check(v.title, 'mode') ? 'Vocabulary_Mode' : 'Vocabulary_Cross') :
          'Vocabulary_Voc';

        return {
          cat: cat,
          choosen: true,
          id: slugs[v.type] + '_' + v.slug_id,
          lang: v.lang,
          thumbnail: {
            type: 'txt',
            content: v.children[0].text
          },
          title: v.title,
          paragraphs: v.children.map(function(p) {
            return {
              text: p.text
            };
          })
        };
      });

      //  -- Subheadings
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
        .concat(docRelated)
        .concat(vocRelated)
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
