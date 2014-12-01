/**
 * AIME-core migration users rule
 * ===============================
 *
 * Rules concerning the migration of users from the mysql database.
 */
var _ = require('lodash');

module.exports = function(mysql, neo4j) {
  return function users(next) {
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
        neo4j.db.label(_.map(results, 'id'), 'User', next);
      });
    });
  }
};
