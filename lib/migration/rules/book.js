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

      var lastChapter;
      chapters.forEach(function(chapter) {
        var fr = en = null;

        // French
        if (chapter.content_fr && chapter.content_fr !== 'frenchContent') {
          fr = book.save({
            type: 'chapter',
            title: chapter.content_fr,
            lang: 'fr',
            page: chapter.page_fr,
            mysql_model: 1,
            mysql_id: chapter.id
          });

          if (lastChapter)
            book.relate(fr, 'FOLLOWS', index[lastChapter].fr);
        }

        // English
        if (chapter.content_en && chapter.content_en !== 'englishContent') {
          en = book.save({
            type: 'chapter',
            title: chapter.content_en,
            lang: 'en',
            page: chapter.page_en,
            mysql_model: 1,
            mysql_id: chapter.id
          });

          if (lastChapter)
            book.relate(en, 'FOLLOWS', index[lastChapter].en);
        }

        // Referencing
        index[chapter.id] = {
          fr: fr,
          en: en
        };

        // Translation edge
        if (fr && en)
          book.relate(en, 'TRANSLATES', fr);

        lastChapter = chapter.id;
      });

      // Subheadings
      var subheadings = _(rows)
        .filter({type: 3})
        .sortBy(['parent_id', 'lft'])
        .value();

      order = 0;
      lastParentId = null;

      var lastSub;
      subheadings.forEach(function(sub) {
        var fr = en = null;

        if (sub.parent_id !== lastParentId)
          order = 0;
        else
          order++;
        lastParentId = sub.parent_id;

        // French
        if (typeof sub.content_fr === 'string' && sub.content_fr !== 'frenchContent') {
          fr = book.save({
            type: 'subheading',
            title: sub.content_fr,
            lang: 'fr',
            page: sub.page_fr,
            mysql_model: 1,
            mysql_id: sub.id
          });

          if (index[sub.parent_id].fr)
            book.relate(index[sub.parent_id].fr, 'HAS', fr, {order: order});

          if (order === 0)
            book.relate(index[sub.parent_id].fr, 'BEGINS_WITH', fr);
          else
            book.relate(fr, 'FOLLOWS', index[lastSub].fr);
        }

        // English
        if (typeof sub.content_en === 'string' && sub.content_en !== 'englishContent') {
          en = book.save({
            type: 'subheading',
            title: sub.content_en,
            lang: 'en',
            page: sub.page_en,
            mysql_model: 1,
            mysql_id: sub.id
          });

          if (index[sub.parent_id].en)
            book.relate(index[sub.parent_id].en, 'HAS', en, {order: order});

          if (order === 0)
            book.relate(index[sub.parent_id].en, 'BEGINS_WITH', en);
          else
            book.relate(en, 'FOLLOWS', index[lastSub].en);
        }

        // Referencing
        index[sub.id] = {
          fr: fr,
          en: en
        };

        // Translation edge
        if (fr && en)
          book.relate(en, 'TRANSLATES', fr);

        lastSub = sub.id;
      });

      // Paragraphs
      var paragraphs = _(rows)
        .filter({type: 4})
        .sortBy(['parent_id', 'lft'])
        .value();

      order = 0;
      lastParentId = null;

      var lastParagraph;
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
            mysql_id: paragraph.id,
            mysql_model: 1
          });

          if (index[paragraph.parent_id].fr)
            book.relate(index[paragraph.parent_id].fr, 'HAS', fr, {order: order});

          if (order === 0)
            book.relate(index[paragraph.parent_id].fr, 'BEGINS_WITH', fr);
          else
            book.relate(fr, 'FOLLOWS', index[lastParagraph].fr);
        }

        // English
        if (paragraph.content_en && paragraph.content_en !== 'englishContent') {
          en = book.save({
            type: 'paragraph',
            text: paragraph.content_en,
            lang: 'en',
            page: paragraph.page_en,
            mysql_id: paragraph.id,
            mysql_model: 1
          });

          if (index[paragraph.parent_id].en)
            book.relate(index[paragraph.parent_id].en, 'HAS', en, {order: order});

          if (order === 0)
            book.relate(index[paragraph.parent_id].en, 'BEGINS_WITH', en);
          else
            book.relate(en, 'FOLLOWS', index[lastParagraph].en);
        }

        // Translation edge
        if (fr && en)
          book.relate(en, 'TRANSLATES', fr);

        // Referencing
        index[paragraph.id] = {
          fr: fr,
          en: en
        };

        lastParagraph = paragraph.id;
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
