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
    mongoConnect = require('../lib/migration/mongo.js'),
    neo4j = require('../lib/migration/neo4j.js'),
    async = require('async'),
    inquirer = require('inquirer'),
    _ = require('lodash'),
    rules;

var mysql,
    mongo;

function teardown() {
  mysql && mysql.end();
  mongo && mongo.close();
}

const SEQ = [
  'book',
  'contributions',
  'uploads',
  'documents',
  'users',
  'vocabulary',
  'modes',
  'scenarii',
  'links',
  'bookmarks',
  'harmony',
  'references',
  'slugs',
  'user_bookmarks',
  'resolve_contributions_links',
  'markdown',
  'cleanup'
];

/**
 * Asking the user for confirmation before doing anything horrible
 */
function confirmation(next) {
  inquirer.prompt(
    [
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Are you sure you want to migrate (this will truncate the neo4j database)?'
      }
    ],
    function(answers) {
      next(answers.confirm ? null : new Error('aborted'));
    }
  );
}

/**
 * Truncating the target neo4j database
 */
function truncate(next) {
  console.log('Truncating neo4j target...');

  neo4j.truncate(function(err, count) {
    if (err) return next(err);

    console.log('Deleted ' + count + ' items in the neo4j target.');
    next();
  });
}

/**
 * MySQL Connection
 */
function mysqlConnection(next) {
  mysqlConnect(function(err, conn) {
    if (err) return next(err);

    mysql = conn;
    next();
  });
}

/**
 * Mongo Connection
 */
function mongoConnection(next) {
  mongoConnect(function(err, conn) {
    if (err) return next(err);

    mongo = conn;
    next();
  });
}


/**
 * Rules making
 */
function makeRules(next) {
  rules = require('../lib/migration/rules')(mysql, neo4j, mongo);
  next();
}

/**
 * Sequence
 */
async.series([
  confirmation,
  truncate,
  mysqlConnection,
  mongoConnection,
  makeRules
], function(err) {

  // Displaying error if any
  if (err && err.message !== 'aborted') {

    teardown();

    console.error(err);
    return;
  }

  // Applying rules
  async.series(SEQ.map(function(i) {return rules[i]}), function(err) {

    if (err) console.error(err);

    teardown();
  });
});
