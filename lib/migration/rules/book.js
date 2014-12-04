/**
 * AIME-core migration book rule
 * ==============================
 *
 * Rules concerning the migration of book from the mysql database.
 */
var _ = require('lodash'),
    async = require('async');

module.exports = function(mysql, neo4j) {
  return function book(next) {
    mysql.query('SELECT * FROM tbl_items', function(err, rows) {
      if (err) return next(err);

      var index = {},
          order = 0,
          lastParentId = null,
          book = neo4j.db.batch();

      // Chapters
      var chapters = _.filter(rows, {type: 2});

      chapters.forEach(function(chapter) {
        var fr = en = null;

        // French
        if (chapter.content_fr && chapter.content_fr !== 'frenchContent') {
          fr = book.save({
            type: 'chapter',
            text: chapter.content_fr,
            lang: 'fr',
            page: chapter.page_fr
          });
        }

        // English
        if (chapter.content_en && chapter.content_en !== 'englishContent') {
          en = book.save({
            type: 'chapter',
            text: chapter.content_en,
            lang: 'en',
            page: chapter.page_en
          });
        }

        // Referencing
        index[chapter.id] = {
          fr: fr,
          en: en
        };

        // Translation edge
        if (fr && en)
          book.relate(en, 'TRANSLATES', fr);
      });

      // Subheadings
      var subheadings = _(rows)
        .filter({type: 3})
        .sortBy(['parent_id', 'lft'])
        .value();

      order = 0;
      lastParentId = null;
      subheadings.forEach(function(sub) {
        var fr = en = null;

        if (sub.parent_id !== lastParentId)
          order = 0;
        else
          order++;
        lastParentId = sub.parent_id;

        // French
        if (sub.content_fr && sub.content_fr !== 'frenchContent') {
          fr = book.save({
            type: 'subheading',
            text: sub.content_fr,
            lang: 'fr',
            page: sub.page_fr
          });

          if (index[sub.parent_id].fr)
            book.relate(index[sub.parent_id].fr, 'HAS', fr, {order: order});
        }

        // English
        if (sub.content_en && sub.content_en !== 'englishContent') {
          en = book.save({
            type: 'subheading',
            text: sub.content_en,
            lang: 'en',
            page: sub.page_en
          });

          if (index[sub.parent_id].en)
            book.relate(index[sub.parent_id].en, 'HAS', en, {order: order});
        }

        // Referencing
        index[sub.id] = {
          fr: fr,
          en: en
        };

        // Translation edge
        if (fr && en)
          book.relate(en, 'TRANSLATES', fr);
      });

      // Paragraphs
      var paragraphs = _(rows)
        .filter({type: 4})
        .sortBy(['parent_id', 'lft'])
        .value();

      order = 0;
      lastParentId = null;
      paragraphs.forEach(function(paragraph) {
        var fr = en = null;

        if (paragraph.parent_id !== lastParentId)
          order = 0;
        else
          order++;
        lastParentId = paragraph.parent_id;

        // French
        if (paragraph.content_fr && paragraph.content_fr !== 'frenchContent') {
          fr = book.save({
            type: 'paragraph',
            text: paragraph.content_fr,
            lang: 'fr',
            page: paragraph.page_fr,
            mysql_id: paragraph.id
          });

          if (index[paragraph.parent_id].fr)
            book.relate(index[paragraph.parent_id].fr, 'HAS', fr, {order: order});
        }

        // English
        if (paragraph.content_en && paragraph.content_en !== 'englishContent') {
          en = book.save({
            type: 'paragraph',
            text: paragraph.content_en,
            lang: 'en',
            page: paragraph.page_en,
            mysql_id: paragraph.id
          });

          if (index[paragraph.parent_id].en)
            book.relate(index[paragraph.parent_id].en, 'HAS', en, {order: order});
        }

        // Translation edge
        if (fr && en)
          book.relate(en, 'TRANSLATES', fr);
      });

      // Commit
      console.log('Saving ' + rows.length + ' book items...');
      book.commit(function(err, results) {
        if (err) return next(err);

        // Labels
        async.parallel({
          chapters: function(n) {
            neo4j.db.label(
              _(results).filter({type: 'chapter'}).map('id').value(),
              ['Book', 'Chapter'],
              n
            );
          },
          subheadings: function(n) {
            neo4j.db.label(
              _(results).filter({type: 'subheading'}).map('id').value(),
              ['Book', 'Subheading'],
              n
            );
          },
          paragraphs: function(n) {
            neo4j.db.label(
              _(results).filter({type: 'paragraph'}).map('id').value(),
              ['Book', 'Paragraph'],
              n
            );
          }
        }, next);
      });
    });
  }
};
