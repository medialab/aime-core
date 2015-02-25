/**
 * AIME-core migration book rule
 * ==============================
 *
 * Rules concerning the migration of book from the mysql database.
 */
var _ = require('lodash'),
    encryption = require('../../encryption.js'),
    async = require('async');

module.exports = function(mysql, neo4j) {
  return function book(next) {
    mysql.query('SELECT * FROM tbl_items', function(err, rows) {
      if (err) return next(err);

      var index = {},
          order = 0,
          lastParentId = null,
          book = neo4j.db.batch();

      // The book itself
      var frenchBook = book.save({
        lang: 'fr',
        type: 'book',
        title: 'Une enquête sur les modes d\'existence'
      });

      var englishBook = book.save({
        lang: 'en',
        type: 'book',
        title: 'An inquiry into modes of existence'
      });

      book.relate(englishBook, 'TRANSLATES', frenchBook);

      // Chapters
      var chapters = _(rows)
        .filter({type: 2})
        .filter(function(c) {
          return c.content_fr !== 'plan d’ensemble';
        })
        .sortByAll(['parent_id', 'lft'])
        .value();

      var lastChapter,
          displayNumberFr = 0,
          displayNumberEn = 0;
      chapters.forEach(function(chapter, i) {
        var fr = en = null;

        // French
        if (chapter.content_fr &&
            chapter.content_fr !== 'frenchContent') {
          fr = book.save({
            type: 'chapter',
            title: chapter.content_fr,
            lang: 'fr',
            page: chapter.page_fr,
            mysql_model: 1,
            mysql_id: chapter.id,
            display_number: (~chapter.content_fr.search(/(introduction|conclusion)/i)) ? '·' : (++displayNumberFr)
          });

          book.relate(frenchBook, 'HAS', fr, {order: i});

          if (lastChapter && index[lastChapter].fr)
            book.relate(fr, 'FOLLOWS', index[lastChapter].fr);
          else
            book.relate(frenchBook, 'BEGINS_WITH', fr);
        }

        // English
        if (chapter.content_en && chapter.content_en !== 'englishContent') {
          en = book.save({
            type: 'chapter',
            title: chapter.content_en,
            lang: 'en',
            page: chapter.page_en,
            mysql_model: 1,
            mysql_id: chapter.id,
            display_number: (~chapter.content_en.search(/(introduction|conclusion)/)) ? '·' : (++displayNumberEn)
          });

          book.relate(englishBook, 'HAS', en, {order: i});

          if (lastChapter && index[lastChapter].en)
            book.relate(en, 'FOLLOWS', index[lastChapter].en);
          else
            book.relate(englishBook, 'BEGINS_WITH', en);
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
        .filter(function(s) {
          return s.id !== 36938;
        })
        .sortByAll(['parent_id', 'lft'])
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
        .filter(function(p) {
          return p.parent_id !== 36938;
        })
        .sortByAll(['parent_id', 'lft'])
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

      // Creating a user for BL
      book.save({
        type: 'user',
        email: 'bruno.latour@sciences-po.fr',
        username: 'bruno.latour@sciences-po.fr',
        password: encryption.rehash('5a450e9f2c75c3009ab7ec8e23d74955'),
        active: true,
        name: 'Bruno',
        surname: 'Latour',
        profile: 'academic',
        role: 'moderator',
        institution: 'SciencesPo',
        department: 'Tarde'
      });

      // Commit
      console.log('Saving ' + rows.length + ' book items...');
      book.commit(function(err, results) {
        if (err) return next(err);

        // Labels
        async.parallel({
          user: function(n) {
            neo4j.db.label(
              _(results).filter({type: 'user'}).map('id').value(),
              'User',
              n
            );
          },
          book: function(n) {
            neo4j.db.label(
              _(results).filter({type: 'book'}).map('id').value(),
              'Book',
              n
            );
          },
          chapters: function(n) {
            neo4j.db.label(
              _(results).filter({type: 'chapter'}).map('id').value(),
              ['BookItem', 'Chapter'],
              n
            );
          },
          subheadings: function(n) {
            neo4j.db.label(
              _(results).filter({type: 'subheading'}).map('id').value(),
              ['BookItem', 'Subheading'],
              n
            );
          },
          paragraphs: function(n) {
            neo4j.db.label(
              _(results).filter({type: 'paragraph'}).map('id').value(),
              ['BookItem', 'Paragraph'],
              n
            );
          }
        }, next);
      });
    });
  }
};
