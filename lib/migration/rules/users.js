/**
 * AIME-core migration users rule
 * ===============================
 *
 * Rules concerning the migration of users from the mysql database.
 */
var async = require('async'),
    _ = require('lodash');

module.exports = function(mysql, neo4j) {
  return function users(topNext) {

    async.waterfall([
      function fetchContributions(next) {
        neo4j.db.query('MATCH n WHERE n:Contribution OR n:Upload RETURN n;', next);
      },
      function users(entities, next) {
        mysql.query('SELECT * FROM tbl_users', function(err, rows) {
          if (err) return next(err);

          // Creating batch
          var users = neo4j.db.batch();
          rows.forEach(function(user) {
            var currentUser = users.save({
              type: 'user',
              email: user.email,
              username: user.username,
              password: user.password,
              active: !!user.active,
              name: user.name,
              surname: user.surname
            });

            // Relating to contributions
            _.filter(entities, function(c) {
              return user.id === c.user_mysql_id && c.type === 'contribution';
            }).forEach(function(c) {
              users.relate(currentUser, 'CREATED', c.id);
            });

            // Relating to their profile picture
            if (user.picture.trim()) {
              var pictureId = +user.picture.trim(),
                  pictureNode = _.find(entities, {type: 'upload', mysql_id: pictureId});

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
