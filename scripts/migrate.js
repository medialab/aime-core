/**
 * AIME-core migration script
 * ===========================
 *
 * This migration script aims at converting the old mysql data structure into
 * the new neo4j one.
 *
 * It aims at being flexible enough so anyone can easily change the rules
 * of said migration.
 */
var mysqlConnect = require('../lib/migration/mysql.js'),
    neo4j = require('../lib/migration/neo4j.js'),
    async = require('async'),
    inquirer = require('inquirer'),
    _ = require('lodash');

var mysql;

/**
 * Functions
 */

// Asking the user whether he really wants to continue
function confirmation(next) {
  inquirer.prompt(
    [
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Are you sure you want to migrate (this will wipe the neo4j database)?'
      }
    ],
    function(answers) {
      next(answers.confirm ? null : new Error('aborted'));
    }
  );
}

// Truncating the target neo4j database
function truncate(next) {
  console.log('Truncating neo4j target...');

  neo4j.truncate(function(err, count) {
    if (err) return next(err);

    console.log('Deleted ' + count + ' items in the neo4j target.');
    next();
  });
}

// Setup mysql connection
function connection(next) {
  mysqlConnect(function(err, conn) {
    if (err) return next(err);

    mysql = conn;
    next();
  });
}

// Deal with the book itself
function book(next) {
  mysql.query('SELECT * FROM tbl_items', function(err, rows) {
    if (err) return next(err);

    var index = {},
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
    var subheadings = _.filter(rows, {type: 3});

    subheadings.forEach(function(sub) {
      var fr = en = null;

      // French
      if (sub.content_fr && sub.content_fr !== 'frenchContent') {
        fr = book.save({
          type: 'subheading',
          text: sub.content_fr,
          lang: 'fr',
          page: sub.page_fr
        });

        if (index[sub.parent_id].fr)
          book.relate(index[sub.parent_id].fr, 'HAS', fr);
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
          book.relate(index[sub.parent_id].en, 'HAS', en);
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
    var paragraphs = _.filter(rows, {type: 4});
    paragraphs.forEach(function(paragraph) {
      var fr = en = null;

      // French
      if (paragraph.content_fr && paragraph.content_fr !== 'frenchContent') {
        fr = book.save({
          type: 'paragraph',
          text: paragraph.content_fr,
          lang: 'fr',
          page: paragraph.page_fr
        });

        if (index[paragraph.parent_id].fr)
          book.relate(index[paragraph.parent_id].fr, 'HAS', fr);
      }

      // English
      if (paragraph.content_en && paragraph.content_en !== 'englishContent') {
        en = book.save({
          type: 'paragraph',
          text: paragraph.content_en,
          lang: 'en',
          page: paragraph.page_en
        });

        if (index[paragraph.parent_id].en)
          book.relate(index[paragraph.parent_id].en, 'HAS', en);
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

// Deal with users
function users(next) {
  mysql.query('SELECT * FROM tbl_users', function(err, rows) {
    if (err) return next(err);

    // Creating batch
    var users = neo4j.db.batch();
    rows.forEach(function(user) {
      users.save({
        type: 'user',
        email: user.email,
        username: user.username,
        password: user.password,
        active: !!user.active,
        name: user.name,
        surname: user.surname
      });
    });

    // Saving
    console.log('Saving ' + rows.length + ' users...');
    users.commit(function(err, results) {
      if (err) return next(err);

      // Adding label
      console.log('Labeling users...');
      neo4j.db.label(_.map(results, 'id'), 'User', next);
    });
  });
}

/**
 * Sequence
 */
async.series([
  confirmation,
  truncate,
  connection,
  book
], function(err) {

  // Closing mysql connection
  mysql && mysql.end();

  // Displaying error if any
  if (err && err.message !== 'aborted') console.error(err);
});
