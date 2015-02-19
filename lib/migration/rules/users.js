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
              return user.password !== '5a450e9f2c75c3009ab7ec8e23d74955';
            })
            .forEach(function(user) {
              var params = {
                type: 'user',
                email: user.email,
                username: user.username,
                password: encryption.rehash(user.password),
                active: !!user.active,
                name: user.name,
                surname: user.surname,
                profile: guessProfile(user),
                role: guessRole(user)
              };

              if (user.institution)
                params.institution = user.institution.trim();

              if (user.department)
                params.department = user.department.trim();

              if (user.discipline)
                params.discipline = user.discipline.trim();

              if (user.interests)
                params.interests = user.interests.trim();

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

          // Creating a user for BL
          users.save({
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
