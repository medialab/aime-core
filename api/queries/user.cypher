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
START u=node({id})
SET u += {properties}
RETURN u;

// name: sos
// Setting a reset token for the user if he wants to update its password
MATCH (u:User {email: {email}})
WHERE not(has(u.reset_token))
SET u.reset_token = {token}
RETURN u;

// name: reset
MATCH (u:User {reset_token: {token}})
SET u.password = {hash}
REMOVE u.reset_token
RETURN u;

// name: all
// Return list of all users
MATCH (u:User {active: true})
RETURN u;
