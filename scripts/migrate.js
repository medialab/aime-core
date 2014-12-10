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
    _ = require('lodash'),
    rules;

var mysql;

const SEQ = [
  'book',
  'contributions',
  'uploads',
  'documents',
  'users',
  'vocabulary',
  'links',
  'bookmarks'
  // 'cleanup'
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
function connection(next) {
  mysqlConnect(function(err, conn) {
    if (err) return next(err);

    mysql = conn;
    next();
  });
}

/**
 * Rules making
 */
function makeRules(next) {
  rules = require('../lib/migration/rules')(mysql, neo4j);
  next();
}

/**
 * Sequence
 */
async.series([
  confirmation,
  truncate,
  connection,
  makeRules
], function(err) {

  // Displaying error if any
  if (err && err.message !== 'aborted') {

    // Closing mysql connection
    mysql && mysql.end();

    console.error(err);
    return;
  }

  // Applying rules
  async.series(SEQ.map(function(i) {return rules[i]}), function(err) {

    if (err) console.error(err);

    // Closing mysql connection
    mysql && mysql.end();
  });
});
