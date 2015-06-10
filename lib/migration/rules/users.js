/**
 * AIME-core migration users rule
 * ===============================
 *
 * Rules concerning the migration of users from the mysql database.
 */
var async = require('async'),
    encryption = require('../../encryption.js'),
    _ = require('lodash');

// Helpers
function guessProfile(user) {
  if (user.academic)
    return 'academic';
  if (user.other_prof)
    return 'other_profession';
  if (user.student)
    return 'student';
  return 'unknown';
}

function guessRole(user) {
  if (user.itemname)
    return user.itemname;
  return 'user';
}

module.exports = function(mysql, neo4j) {
  return function users(topNext) {

    async.waterfall([
      function fetchContributions(next) {
        neo4j.db.query('MATCH n WHERE n:Contribution OR n:Media RETURN n;', next);
      },
      function users(entities, next) {
        mysql.query('SELECT * FROM tbl_users LEFT JOIN AuthAssignment ON AuthAssignment.userid = tbl_users.id', function(err, rows) {
          if (err) return next(err);

          // Creating batch
          var users = neo4j.db.batch();
          rows
            .filter(function(user) {

              // Avoiding BL so we can merge him later
              return user.password !== 'df6d10a55bdacc5aab7754425c5d96f8';
            })
            .forEach(function(user) {
              if (user.create_time === '0000-00-00 00:00:00')
                user.create_time = user.last_login_time;
              if (!user.create_time || user.create_time === '0000-00-00 00:00:00')
                user.create_time = '2012-09-01 00:00:00';

              var params = {
                type: 'user',
                mysql_id: user.id,
                email: user.email,
                username: user.username,
                password: encryption.rehash(user.password),
                active: true,
                name: user.name,
                surname: user.surname,
                profile: guessProfile(user),
                role: guessRole(user),
                date: user.create_time.split(' ')[0].replace(/-/g, '')
              };

              if (user.institution && user.institution.trim())
                params.institution = user.institution.trim();

              if (user.department && user.department.trim())
                params.department = user.department.trim();

              if (user.discipline && user.discipline.trim())
                params.discipline = user.discipline.trim();

              if (user.interests && user.interests.trim())
                params.interests = user.interests.trim();

              if (user.keywords && user.keywords.trim())
                params.keywords = user.keywords.trim();

              var currentUser = users.save(params);

              // Relating to contributions
              _.filter(entities, function(c) {
                return user.id === c.user_mysql_id && c.type === 'contribution';
              }).forEach(function(c) {
                users.relate(c.id, 'CREATED_BY', currentUser);
              });

              // Relating to their profile picture
              if (user.picture.trim()) {
                var pictureId = +user.picture.trim(),
                    pictureNode = _.find(entities, {type: 'media', mysql_id: pictureId});

                users.relate(pictureNode.id, 'AVATAR_OF', currentUser);
              }
            });

          // Saving
          console.log('Saving ' + rows.length + ' users...');
          users.commit(function(err, results) {
            if (err) return next(err);

            // Adding label
            neo4j.db.label(_(results).filter({type: 'user'}).map('id').value(), 'User', next);
          });
        });
      }
    ], topNext);
  }
};
