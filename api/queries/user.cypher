// name: login
// Attempt to log a user through an email and a password hash
MATCH (u:User {email: {email}, password: {hash}, active: {active}})
OPTIONAL MATCH (u)<-[:AVATAR_OF]-(a:Media)
RETURN u AS user, a AS avatar;

// name: create
// Creates a single user and returns it
CREATE (u:User {properties})
RETURN u;

// name: activate
// Activate a single user by token
MATCH (u:User {token: {token}, active: false})
OPTIONAL MATCH (u)<-[:AVATAR_OF]-(a:Media)
SET u.active = true
REMOVE u.token
RETURN u AS user, a AS avatar;

// name: update
// Update a single user
MATCH (u:User)
WHERE id(u) = {id}
SET u += {properties}
RETURN u;
