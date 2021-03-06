/**
 * AIME-core migration modes rule
 * ==============================
 *
 * Rules concerning the migration of modes from the mongo database.
 */
var async = require('async'),
    _ = require('lodash');

/**
 * Data
 */
const modes = [
  'REP',
  'MET',
  'HAB',
  'TEC',
  'FIC',
  'REF',
  'POL',
  'DRO',
  'REL',
  'ATT',
  'ORG',
  'MOR',
  'RES',
  'PRE',
  'DC'
];

const crossings = (function() {
  return _(modes)
    .map(function(mode) {
      var c = [],
          i,
          l;

      for (i = modes.indexOf(mode) + 1, l = modes.length; i < l; i++)
        c.push(mode + '-' + modes[i]);

      return c;
    })
    .flatten()
    .value();
})();

/**
 * Misc Helpers
 */
function inverse(m) {
  if (m === 'RES')
    return 'NET';
  else if (m === 'DRO')
    return 'LAW';
  return m;
}

function translate(m) {
  if (m === 'NET')
    return 'RES';
  else if (m === 'LAW')
    return 'DRO';
  return m.replace(/NET-/, 'RES-')
          .replace(/LAW-/, 'DRO-')
          .replace(/-NET/, '-RES')
          .replace(/-LAW/, '-DRO');
}

function getRelatedModes(related) {
  return _(related)
    .map(function(r) {
      return r.split('-').map(translate);
    })
    .flatten()
    .uniq()
    .value();
}

function getRelatedCrossings(related) {
  return _(related)
    .filter(function(r) {
      return r.split('-').length > 1;
    })
    .map(translate)
    .uniq()
    .value();
}

module.exports = function(mongo, neo4j) {
  return function(topNext) {
    async.waterfall([
      function fetchData(next) {

        async.series({
          nodes: function(n) {
            neo4j.db.query('MATCH n WHERE n:User OR n:Vocabulary OR n:Subheading OR n:Contribution OR n:Document RETURN n;', n);
          },
          subheadings: function(n) {
            mongo.collection('books').find({}).toArray(n);
          },
          contributions: function(n) {
            mongo.collection('conts').find({}).toArray(n);
          },
          documents: function(n) {
            mongo.collection('docs').find({}).toArray(n);
          },
          vocabulary: function(n) {
            mongo.collection('vocs').find({}).toArray(n);
          }
        }, next);
      },
      function saveModes(data, next) {
        var batch = neo4j.db.batch();

        // A node per mode
        var modeNodes = {};
        modes.forEach(function(mode) {
          modeNodes[mode] = batch.save({
            type: 'mode',
            name: mode
          });

          // Link to their vocs
          var defs = _(data.nodes)
            .filter(function(node) {
              return node.type === 'vocabulary' &&
                     (node.title === '[' + mode + ']' || node.title === '[' + inverse(mode) + ']');
            })
            .take(2)
            .value();

          if (!defs.length)
            console.log('No voc entry for mode "' + mode + '".');

          defs.forEach(function(def) {
            batch.relate(def.id, 'DEFINES', modeNodes[mode]);
          });
        });

        // A node per crossing
        var crossingNodes = {};
        crossings.forEach(function(crossing) {
          var m = crossing.split('-');

          crossingNodes[crossing] = batch.save({
            type: 'crossing',
            name: crossing
          });

          // Links
          batch.relate(crossingNodes[crossing], 'HAS', modeNodes[m[0]]);
          batch.relate(crossingNodes[crossing], 'HAS', modeNodes[m[1]]);

          // Link to their vocs
          var defs = _(data.nodes)
            .filter(function(node) {
              return node.type === 'vocabulary' &&
                     (node.title === '[' + m[0] + '·' + m[1] + ']' ||
                      node.title === '[' + m[1] + '·' + m[0] + ']' ||
                      node.title === '[' + inverse(m[0]) + '·' + inverse(m[1]) + ']' ||
                      node.title === '[' + inverse(m[1]) + '·' + inverse(m[0]) + ']');
            })
            .take(2)
            .value();

          defs.forEach(function(def) {
            batch.relate(def.id, 'DEFINES', crossingNodes[crossing]);
          });
        });

        // Linking subheadings to modes and crossings
        _(data.subheadings)
          .map(function(d) {
            return d.subchapters.map(function(s) {
              return {
                lang: d.lang,
                mysql_id: +s.id.replace(/bsc_/, ''),
                related: s.related || []
              };
            });
          })
          .flatten()
          .filter(function(sub) {
            return sub.related.length;
          })
          .forEach(function(sub) {
            var subNode = _.find(data.nodes, {type: 'subheading', mysql_id: sub.mysql_id, lang: sub.lang});

            // Linking related modes
            getRelatedModes(sub.related).forEach(function(rm) {
              batch.relate(subNode.id, 'RELATES_TO', modeNodes[rm]);
            });

            // Linking related crossings
            getRelatedCrossings(sub.related).forEach(function(rc) {
              batch.relate(subNode.id, 'RELATES_TO', crossingNodes[rc]);
            });
          }).value();

        // Linking contributions to modes and crossings
        _(data.contributions)
          .filter(function(cont) {
            return cont.related && cont.related.length;
          })
          .forEach(function(cont) {

            var contNode = _.find(data.nodes, {
              type: 'contribution',
              mysql_id: +cont.id.replace(/cont_/, '')
            });

            // WARNING - if contribution node does not exist we have a new contribution
            if (!contNode) {

              // Root node
              contNode = batch.save({
                type: 'contribution',
                lang: cont.lang,
                status: cont.status === 'mediated' ? 'moderation' : cont.status,
                source_platform: 'crossings',
                mysql_id: +cont.id.replace(/cont_/, ''),
                title: cont.title,
                date: cont.date.toISOString().split('T')[0].replace(/-/g, ''),
                last_update: cont.date.toISOString().split('T')[0].replace(/-/g, '')
              });

              // Retrieving author
              var authorId = +cont.author.id.split('_')[1],
                  authorNode = _.find(data.nodes, {type: 'user', mysql_id: authorId});

              batch.relate(contNode, 'CREATED_BY', authorNode);

              // First slide
              var firstSlide = batch.save({
                type: 'slide',
                lang: cont.lang
              });

              var paragraphNode = batch.save({
                lang: cont.lang,
                type: 'paragraph',
                text: cont.text
              });

              batch.relate(firstSlide, 'HAS', paragraphNode, {order: 0});
              batch.relate(contNode, 'HAS', firstSlide, {order: 0});

              // Slides
              cont.slides.forEach(function(slide, i) {
                var slideNode = batch.save({
                  type: 'slide',
                  lang: cont.lang
                });

                batch.relate(contNode, 'HAS', slideNode, {order: i + 1});

                // Adding elements
                var subOrder = 0;
                if (slide.text) {

                  // Paragraphs
                  var paragraphNode = batch.save({
                    lang: cont.lang,
                    type: 'paragraph',
                    markdown: slide.text,
                    text: slide.text
                  });
                  batch.label(paragraphNode, 'Paragraph');

                  batch.relate(slideNode, 'HAS', paragraphNode, {order: subOrder});
                  subOrder++;

                  // Ref
                  if (slide.ref && !slide.document) {
                    var refNode = batch.save({
                      type: 'reference',
                      lang: cont.lang,
                      text: slide.ref
                    });
                    batch.label(refNode, 'Reference');

                    batch.relate(refNode, 'DESCRIBES', paragraphNode);
                  }
                }
                if (slide.document) {
                  var el = slide.document;

                  if (!el.url || !el.html)
                    console.log('Crossings contribution weird element:', el, slide);

                  // Media
                  var mediaData;

                  if (/modesofexistence\.org/.test(el.url) && el.type === 'img') {
                    var path = el.url.replace(/http:\/\/(www\.)?modesofexistence\.org\/medias\//, '');

                    mediaData = {
                      type: 'media',
                      internal: true,
                      kind: 'image',
                      path: 'crossings/' + path
                    };
                  }
                  else {
                    mediaData = {
                      type: 'media',
                      internal: false,
                      html: el.type === 'image' ?
                        '<img src="' + el.url + '" />' :
                        el.html,
                      url: el.url,
                      kind: 'rich'
                    };
                  }

                  if (el.type === 'link' && !/^<a/.test(el.html))
                    mediaData.html = '<a href="' + el.url + '" target="_blank">' + el.url + '</a>';

                  // Guessing the kind
                  if (el.type === 'video')
                    mediaData.kind = 'video';
                  else if (el.type === 'img')
                    mediaData.kind = 'image';
                  else if (/^<a/.test(el.html) || el.type === 'link')
                    mediaData.kind = 'link';
                  else if (/scribd/.test(el.url))
                    mediaData.kind = 'pdf';
                  else if (/iframe/.test(el.html))
                    mediaData.kind = 'rich';
                  else
                    console.log('Crossings contribution weird element:', el, slide);

                  // Saving the node
                  var mediaNode = batch.save(mediaData);
                  batch.label(mediaNode, 'Media');

                  batch.relate(slideNode, 'HAS', mediaNode, {order: subOrder});

                  // Ref
                  if (slide.ref) {
                    var refNode = batch.save({
                      type: 'reference',
                      lang: cont.lang,
                      text: slide.ref
                    });
                    batch.label(refNode, 'Reference');

                    batch.relate(refNode, 'DESCRIBES', mediaNode);
                  }
                }
                else if (!slide.text && !slide.document && slide.ref) {

                  // Lone reference
                  var refNode = batch.save({
                    type: 'reference',
                    lang: cont.lang,
                    text: slide.ref
                  });
                  batch.label(refNode, 'Reference');

                  batch.relate(slideNode, 'HAS', refNode, {order: 0});
                }
                else if (!slide.text && !slide.document && !slider.ref) {
                  console.log('Crossings contribution weird slide:', slide);
                }
              });
            }

            // Linking related modes
            getRelatedModes(cont.related).forEach(function(rm) {
              batch.relate(contNode, 'RELATES_TO', modeNodes[rm]);
            });

            // Linking related crossings
            getRelatedCrossings(cont.related).forEach(function(rc) {
              batch.relate(contNode, 'RELATES_TO', crossingNodes[rc]);
            });
          }).value();

        // Linking documents to modes and crossings
        _(data.documents)
          .filter(function(doc) {
            return doc.related && doc.related.length;
          })
          .forEach(function(doc) {

            var docNode = _.find(data.nodes, {
              type: 'document',
              mysql_id: +doc.id.replace(/doc_/, ''),
              lang: doc.lang
            });

            // WARNING
            if (!docNode)
              return;

            // Linking related modes
            getRelatedModes(doc.related).forEach(function(rm) {
              batch.relate(docNode.id, 'RELATES_TO', modeNodes[rm]);
            });

            // Linking related crossings
            getRelatedCrossings(doc.related).forEach(function(rc) {
              batch.relate(docNode.id, 'RELATES_TO', crossingNodes[rc]);
            });
          }).value();

        // Linking remaining vocabulary to modes and crossings
        _(data.vocabulary)
          .filter(function(voc) {
            return voc.related && voc.related.length;
          })
          .forEach(function(voc) {

            var vocNode = _.find(data.nodes, {
              type: 'vocabulary',
              mysql_id: +voc.id.replace(/voc_/, ''),
              lang: voc.lang
            });

            // WARNING
            if (!vocNode)
              console.log(voc);

            // Linking related modes
            getRelatedModes(voc.related).forEach(function(rm) {
              batch.relate(vocNode.id, 'RELATES_TO', modeNodes[rm]);
            });

            // Linking related crossings
            getRelatedCrossings(voc.related).forEach(function(rc) {
              batch.relate(vocNode.id, 'RELATES_TO', crossingNodes[rc]);
            });
          }).value();

        console.log('Saving modes and crossings...');
        batch.commit(next);
      },
      function labels(results, next) {
        async.parallel({
          modes: function(n) {
            neo4j.db.label(
              _(results).filter({type: 'mode'}).map('id').value(),
              'Mode',
              n
            );
          },
          crossings: function(n) {
            neo4j.db.label(
              _(results).filter({type: 'crossing'}).map('id').value(),
              'Crossing',
              n
            );
          },
          paragraph: function(n) {
            neo4j.db.label(
              _(results).filter({type: 'paragraph'}).map('id').value(),
              'Paragraph',
              n
            );
          },
          contribution: function(n) {
            neo4j.db.label(
              _(results).filter({type: 'contribution'}).map('id').value(),
              'Contribution',
              n
            );
          },
          slide: function(n) {
            neo4j.db.label(
              _(results).filter({type: 'slide'}).map('id').value(),
              'Slide',
              n
            );
          }
        }, next);
      }
    ], topNext);
  };
};
